// Route names and words that can't be claimed as a username
export const RESERVED_USERNAMES = new Set([
  "admin", "api", "app", "about", "account", "auth", "blog", "dashboard", "demo", "docs",
  "edit", "help", "home", "login", "logout", "new", "pricing", "privacy", "profile",
  "search", "settings", "signin", "signup", "static", "support", "terms", "www", "_next", "favicon",
]);

const USERNAME_RE = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

/** Returns an error message, or null when the username is valid. */
export function validateUsername(raw: string): string | null {
  const u = raw.trim().toLowerCase();
  if (u.length < 3) return "At least 3 characters.";
  if (u.length > 30) return "At most 30 characters.";
  if (!USERNAME_RE.test(u)) return "Use lowercase letters, numbers and hyphens (not at the start or end).";
  if (u.includes("--")) return "No double hyphens.";
  if (RESERVED_USERNAMES.has(u)) return "That name is reserved.";
  return null;
}
