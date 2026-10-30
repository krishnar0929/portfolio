// Public directory search (server-side). Only publicProfiles is queried, which
// holds public profiles only — drafts and private profiles can never appear.
import { collection, getDocs, getFirestore, limit, query, where } from "firebase/firestore/lite";
import { firebaseApp, isFirebaseConfigured } from "./firebase";
import { tokenize } from "./search";
import { displayLocation, fullName, normalizeProfile, type Profile } from "./types";

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

function toResult(p: Profile): DirectoryResult {
  return {
    username: p.username,
    name: fullName(p) || p.username,
    title: p.title,
    avatarUrl: p.avatarUrl,
    location: displayLocation(p),
    available: p.available,
    skills: p.skills.flatMap((g) => g.items).slice(0, 4),
    accent: p.accent,
  };
}

/**
 * Matches every word of the query against name, headline, skills, city,
 * state, ZIP or country — e.g. "alex atlanta", "react 30303", "riv".
 */
export async function searchProfiles(raw: string): Promise<DirectoryResult[]> {
  const words = Array.from(new Set(tokenize(raw.replace(/(\d)\s+(?=\d)/g, "$1")))).slice(0, 6);
  if (!isFirebaseConfigured || words.length === 0) return [];

  // Query on the most selective (longest) word, filter the rest in memory
  const [first, ...rest] = [...words].sort((a, b) => b.length - a.length);
  const db = getFirestore(firebaseApp());
  try {
    const snap = await getDocs(
      query(collection(db, "publicProfiles"), where("searchTokens", "array-contains", first), limit(50)),
    );
    return snap.docs
      .map((d) => d.data())
      .filter((data) => {
        const tokens: unknown = data.searchTokens;
        return Array.isArray(tokens) && rest.every((w) => tokens.includes(w));
      })
      .slice(0, MAX_RESULTS)
      .map((data) => toResult(normalizeProfile(data)));
  } catch {
    return [];
  }
}
