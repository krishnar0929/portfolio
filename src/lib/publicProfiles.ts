// Server-side reads for profile pages. Uses Firestore Lite (REST over fetch),
// which runs cleanly in Next.js server components without gRPC.
// Only ever reads data that is readable by anyone: the username handle and,
// for public profiles, the public copy. Private content is never fetched here.
import { doc, getDoc, getFirestore } from "firebase/firestore/lite";
import { firebaseApp, isFirebaseConfigured } from "./firebase";
import { normalizeProfile, type Profile } from "./types";
import { validateUsername } from "./username";

export type ProfileView =
  | { kind: "public"; profile: Profile }
  | { kind: "private"; uid: string; username: string };

export async function getProfileView(username: string): Promise<ProfileView | null> {
  const u = username.toLowerCase();
  if (!isFirebaseConfigured || validateUsername(u)) return null;

  const db = getFirestore(firebaseApp());
  try {
    const handle = await getDoc(doc(db, "usernames", u));
    if (!handle.exists()) return null;
    const { uid, visibility } = handle.data() as { uid: string; visibility?: string };

    if (visibility === "private") return { kind: "private", uid, username: u };
    if (visibility !== "public") return null;

    const snap = await getDoc(doc(db, "publicProfiles", u));
    if (!snap.exists()) return null;
    return { kind: "public", profile: normalizeProfile(snap.data() as Partial<Profile>) };
  } catch {
    return null;
  }
}
