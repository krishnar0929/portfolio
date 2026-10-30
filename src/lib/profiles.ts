"use client";

// Client-side profile reads/writes for the signed-in owner.
//
// Storage layout (see firestore.rules):
//   usernames/{username}               { uid, visibility, hasPassword }  tells the page what to show
//   profiles/{uid}                     full profile + privateKey          owner only (the editor's source of truth)
//   publicProfiles/{username}          visitor copy + searchTokens        anyone; only while Public
//   sharedProfiles/{uid}               visitor copy                       owner + invited emails; only while Private
//   sharedProfiles/{uid}/viewers/{email}                                  one doc per invited email (owner-managed)
//   privateProfiles/{key}              visitor copy                       anyone who can derive key from the password
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
import { searchTokensFor } from "./search";
import { emptyProfile, normalizeEmail, normalizeProfile, publishedView, type Profile } from "./types";
import { validateUsername } from "./username";

const db = () => getFirestore(firebaseApp());

/** Firestore rejects `undefined`; strip it by round-tripping through JSON. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export type OwnerProfile = {
  profile: Profile;
  /** Key the password copy is stored under, or null if no page password is set. */
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
 * After a rename, call saveProfile() so the visitor copies are refreshed.
 */
export async function claimUsername(uid: string, rawUsername: string, seed: Partial<Profile> = {}): Promise<Profile> {
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
    const current = existingData ? normalizeProfile(existingData) : normalizeProfile({ ...emptyProfile(username), ...seed });

    if (current.username && current.username !== username) {
      tx.delete(doc(firestore, "usernames", current.username));
      tx.delete(doc(firestore, "publicProfiles", current.username));
    }

    const next: Profile = { ...current, username };
    tx.set(handleRef, { uid, visibility: next.visibility, hasPassword: false });
    tx.set(profileRef, {
      ...clean(next),
      privateKey: existingData && isPrivateKey(existingData.privateKey) ? existingData.privateKey : null,
      updatedAt: serverTimestamp(),
    });
    return next;
  });
}

export type SaveOptions = {
  /** Key for the password copy (null = no page password). */
  privateKey: string | null;
  /** Key the password copy was last stored under, so changes remove the old copy. */
  previousKey: string | null;
  /** Invited emails as last saved, so removed ones lose access. */
  previousEmails: string[];
};

/**
 * Save the owner's profile and sync every copy visitors read, in one batch:
 * - public  → publicProfiles/{username} (searchable)
 * - private → sharedProfiles/{uid} (invited emails) and, if a password is set, privateProfiles/{key}
 * - draft   → no visitor copies
 */
export async function saveProfile(uid: string, profile: Profile, opts: SaveOptions): Promise<void> {
  const firestore = db();
  const batch = writeBatch(firestore);
  const now = serverTimestamp();
  const { privateKey, previousKey, previousEmails } = opts;

  const emails = Array.from(new Set(profile.authorizedEmails.map(normalizeEmail).filter(Boolean)));
  const owner: Profile = { ...profile, authorizedEmails: emails };
  const visitorCopy = clean(publishedView(owner));
  const isPrivate = owner.visibility === "private";
  const hasPassword = isPrivate && isPrivateKey(privateKey);

  batch.set(doc(firestore, "profiles", uid), { ...clean(owner), privateKey, updatedAt: now });
  batch.set(doc(firestore, "usernames", owner.username), { uid, visibility: owner.visibility, hasPassword });

  // Public copy
  const publicRef = doc(firestore, "publicProfiles", owner.username);
  if (owner.visibility === "public") {
    batch.set(publicRef, { ...visitorCopy, ownerUid: uid, searchTokens: searchTokensFor(owner), updatedAt: now });
  } else {
    batch.delete(publicRef);
  }

  // Copy for invited emails
  const sharedRef = doc(firestore, "sharedProfiles", uid);
  if (isPrivate) batch.set(sharedRef, { ...visitorCopy, ownerUid: uid, updatedAt: now });
  else batch.delete(sharedRef);

  const before = new Set(previousEmails.map(normalizeEmail));
  for (const email of emails) {
    if (!before.has(email)) batch.set(doc(firestore, "sharedProfiles", uid, "viewers", email), { addedAt: now });
  }
  for (const email of Array.from(before)) {
    if (!emails.includes(email)) batch.delete(doc(firestore, "sharedProfiles", uid, "viewers", email));
  }

  // Copy for password holders
  if (hasPassword && privateKey) {
    batch.set(doc(firestore, "privateProfiles", privateKey), { ...visitorCopy, ownerUid: uid, updatedAt: now });
  } else if (privateKey) {
    batch.delete(doc(firestore, "privateProfiles", privateKey));
  }
  if (previousKey && previousKey !== privateKey) {
    batch.delete(doc(firestore, "privateProfiles", previousKey));
  }

  await batch.commit();
}
