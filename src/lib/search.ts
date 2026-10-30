// Search tokens stored on public profiles so they can be found by name, title,
// skills, city, state, ZIP or country. Firestore has no full-text search, so we
// store lowercase words (plus prefixes for names/places) and query with
// `array-contains` on one word, then filter the rest.
import type { Profile } from "./types";

const MAX_TOKENS = 400;
const MAX_PREFIX = 15;

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^\p{L}\p{N}+#]+/u)
    .filter((w) => w.length >= 2);
}

function withPrefixes(words: string[]): string[] {
  const out: string[] = [];
  for (const w of words) {
    for (let i = 2; i < Math.min(w.length, MAX_PREFIX); i++) out.push(w.slice(0, i));
    out.push(w);
  }
  return out;
}

export function searchTokensFor(p: Profile): string[] {
  const prefixed = withPrefixes(
    tokenize(
      [p.firstName, p.middleName, p.lastName, p.title, p.city, p.region, p.country, p.username, p.zip.replace(/\s+/g, "")].join(" "),
    ),
  );
  const exact = tokenize([...p.skills.flatMap((g) => g.items), ...p.specialties].join(" "));
  return Array.from(new Set([...prefixed, ...exact])).slice(0, MAX_TOKENS);
}
