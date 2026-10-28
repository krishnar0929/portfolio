// Public directory search (server-side). Only publicProfiles is queried, which
// holds public profiles only — drafts and private profiles can never appear.
import { collection, getDocs, getFirestore, limit, orderBy, query, where } from "firebase/firestore/lite";
import { firebaseApp, isFirebaseConfigured } from "./firebase";
import { cityKey, displayLocation, normalizeProfile, zipKey, type Profile } from "./types";

export type DirectoryResult = {
  username: string;
  name: string;
  title: string;
  avatarUrl: string;
  location: string;
  available: boolean;
  skills: string[];
  accent: string;
};

export const MAX_RESULTS = 30;

/** Digits (or a typical postal-code shape) → ZIP search; anything else → city search. */
export function looksLikeZip(q: string) {
  return /\d/.test(q) && /^[a-z0-9 -]{2,10}$/i.test(q.trim());
}

function toResult(p: Profile): DirectoryResult {
  return {
    username: p.username,
    name: p.name || p.username,
    title: p.title,
    avatarUrl: p.avatarUrl,
    location: displayLocation(p),
    available: p.available,
    skills: p.skills.flatMap((g) => g.items).slice(0, 4),
    accent: p.accent,
  };
}

/** Prefix match on city or ZIP, e.g. "atl" → Atlanta, "303" → 30303. */
export async function searchProfiles(raw: string): Promise<DirectoryResult[]> {
  const q = raw.trim();
  if (!isFirebaseConfigured || q.length < 2) return [];

  const field = looksLikeZip(q) ? "zipKey" : "cityKey";
  const value = field === "zipKey" ? zipKey(q) : cityKey(q);

  const db = getFirestore(firebaseApp());
  try {
    const snap = await getDocs(
      query(
        collection(db, "publicProfiles"),
        where(field, ">=", value),
        where(field, "<=", `${value}`),
        orderBy(field),
        limit(MAX_RESULTS),
      ),
    );
    return snap.docs.map((d) => toResult(normalizeProfile(d.data() as Partial<Profile>)));
  } catch {
    return [];
  }
}
