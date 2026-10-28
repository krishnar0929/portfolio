"use client";

// Client-side profile reads/writes for the signed-in owner.
import {
  doc,
  getDoc,
  getFirestore,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firebaseApp } from "./firebase";
import { emptyProfile, normalizeProfile, type Profile } from "./types";
import { validateUsername } from "./username";

const db = () => getFirestore(firebaseApp());

/** Firestore rejects `undefined`; strip it by round-tripping through JSON. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function getMyProfile(uid: string): Promise<Profile | null> {
  const snap = await getDoc(doc(db(), "profiles", uid));
  return snap.exists() ? normalizeProfile(snap.data() as Partial<Profile>) : null;
}

export class UsernameTakenError extends Error {
  constructor() {
    super("That username is already taken.");
  }
}

/**
 * Claim (or change) a username atomically. Releases the old handle if the
 * user had one, and creates the profile doc on first claim.
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
    const current = existing.exists()
      ? normalizeProfile(existing.data() as Partial<Profile>)
      : normalizeProfile({ ...emptyProfile(username), ...seed });

    if (current.username && current.username !== username) {
      tx.delete(doc(firestore, "usernames", current.username));
    }

    const next: Profile = { ...current, username };
    if (!handle.exists()) tx.set(handleRef, { uid });
    tx.set(profileRef, { ...clean(next), updatedAt: serverTimestamp() });
    return next;
  });
}

export async function saveProfile(uid: string, profile: Profile): Promise<void> {
  await setDoc(doc(db(), "profiles", uid), {
    ...clean(profile),
    updatedAt: serverTimestamp(),
  });
}
