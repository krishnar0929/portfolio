"use client";

// Client-side profile reads/writes for the signed-in owner.
//
// Storage layout (see firestore.rules):
//   usernames/{username}     { uid, visibility }        public: tells the page what to show
//   profiles/{uid}           full profile + privateKey  owner only (the editor's source of truth)
//   publicProfiles/{name}    copy of the content        readable/searchable by anyone, only while visibility = public
//   privateProfiles/{key}    copy of the content        readable only by someone who can derive key from the password
import {
  doc,
  getDoc,
  getFirestore,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { firebaseApp } from "./firebase";
import { isPrivateKey } from "./privateKey";
import { cityKey, emptyProfile, normalizeProfile, zipKey, type Profile } from "./types";
import { validateUsername } from "./username";

const db = () => getFirestore(firebaseApp());

/** Firestore rejects `undefined`; strip it by round-tripping through JSON. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export type OwnerProfile = {
  profile: Profile;
  /** Key the private copy is stored under, or null if no password was ever set. */
  privateKey: string | null;
};

export async function getMyProfile(uid: string): Promise<OwnerProfile | null> {
  const snap = await getDoc(doc(db(), "profiles", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { profile: normalizeProfile(data), privateKey: isPrivateKey(data.privateKey) ? data.privateKey : null };
}

export class UsernameTakenError extends Error {
  constructor() {
    super("That username is already taken.");
  }
}

/**
 * Claim (or change) a username atomically. Releases the old handle (and its
 * public copy) if the user had one, and creates the profile doc on first claim.
 * After a rename, call saveProfile() so the public copy is recreated.
 */
export async function claimUsername(
  uid: string,
  rawUsername: string,
  seed: Partial<Profile> = {},
): Promise<Profile> {
  const username = rawUsername.trim().toLowerCase();
  const invalid = validateUsername(username);
  if (invalid) throw new Error(invalid);

  const firestore = db();
  const handleRef = doc(firestore, "usernames", username);
  const profileRef = doc(firestore, "profiles", uid);

  return runTransaction(firestore, async (tx) => {
    const handle = await tx.get(handleRef);
    if (handle.exists() && handle.data().uid !== uid) throw new UsernameTakenError();

    const existing = await tx.get(profileRef);
    const existingData = existing.exists() ? existing.data() : null;
    const current = existingData
      ? normalizeProfile(existingData)
      : normalizeProfile({ ...emptyProfile(username), ...seed });

    if (current.username && current.username !== username) {
      tx.delete(doc(firestore, "usernames", current.username));
      tx.delete(doc(firestore, "publicProfiles", current.username));
    }

    const next: Profile = { ...current, username };
    tx.set(handleRef, { uid, visibility: next.visibility });
    tx.set(profileRef, {
      ...clean(next),
      privateKey: existingData && isPrivateKey(existingData.privateKey) ? existingData.privateKey : null,
      updatedAt: serverTimestamp(),
    });
    return next;
  });
}

/**
 * Save the owner's profile and sync the copy visitors read, in one batch:
 * - public  → publicProfiles/{username}; private copy removed
 * - private → privateProfiles/{privateKey}; public copy removed
 * - draft   → both copies removed
 * `previousKey` is the key the private copy was last stored under, so a
 * password change removes the old copy.
 */
export async function saveProfile(
  uid: string,
  profile: Profile,
  privateKey: string | null,
  previousKey: string | null,
): Promise<void> {
  if (profile.visibility === "private" && !isPrivateKey(privateKey)) {
    throw new Error("Set a password before making your page private.");
  }

  const firestore = db();
  const batch = writeBatch(firestore);
  const content = clean(profile);
  const now = serverTimestamp();

  batch.set(doc(firestore, "profiles", uid), { ...content, privateKey, updatedAt: now });
  batch.set(doc(firestore, "usernames", profile.username), { uid, visibility: profile.visibility });

  const publicRef = doc(firestore, "publicProfiles", profile.username);
  if (profile.visibility === "public") {
    // cityKey/zipKey power the "search by city or ZIP" directory
    batch.set(publicRef, {
      ...content,
      ownerUid: uid,
      cityKey: cityKey(profile.city),
      zipKey: zipKey(profile.zip),
      updatedAt: now,
    });
  } else {
    batch.delete(publicRef);
  }

  if (profile.visibility === "private" && privateKey) {
    batch.set(doc(firestore, "privateProfiles", privateKey), { ...content, ownerUid: uid, updatedAt: now });
  } else if (privateKey) {
    batch.delete(doc(firestore, "privateProfiles", privateKey));
  }
  if (previousKey && previousKey !== privateKey) {
    batch.delete(doc(firestore, "privateProfiles", previousKey));
  }

  await batch.commit();
}
