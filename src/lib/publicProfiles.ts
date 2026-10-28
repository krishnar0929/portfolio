// Server-side reads for public pages. Uses Firestore Lite (REST over fetch),
// which runs cleanly in Next.js server components without gRPC.
import { doc, getDoc, getFirestore } from "firebase/firestore/lite";
import { firebaseApp, isFirebaseConfigured } from "./firebase";
import { normalizeProfile, type Profile } from "./types";
import { validateUsername } from "./username";

export async function getPublicProfile(username: string): Promise<Profile | null> {
  const u = username.toLowerCase();
  if (!isFirebaseConfigured || validateUsername(u)) return null;

  const db = getFirestore(firebaseApp());
  try {
    const handle = await getDoc(doc(db, "usernames", u));
    if (!handle.exists()) return null;
    const uid = handle.data().uid as string;

    const snap = await getDoc(doc(db, "profiles", uid));
    if (!snap.exists()) return null;
    const profile = normalizeProfile(snap.data() as Partial<Profile>);
    return profile.published ? profile : null;
  } catch {
    // Unpublished profiles are rejected by security rules -> treat as not found
    return null;
  }
}
