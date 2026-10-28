// A private profile is stored at privateProfiles/{key}, where key is derived
// from the owner's password. Visitors who know the password derive the same
// key in their browser and can read the doc; without it the doc can't be found
// (listing is blocked by the security rules). The password itself is never stored.

const ITERATIONS = 200_000;

export async function derivePrivateKey(uid: string, password: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("This browser can't unlock private pages (needs HTTPS).");
  }
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: enc.encode(`portfolio-private:${uid}`), iterations: ITERATIONS },
    material,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const isPrivateKey = (k: unknown): k is string => typeof k === "string" && /^[a-f0-9]{64}$/.test(k);
