import {
  ChatIcon,
  GithubIcon,
  GlobeIcon,
  LinkedinIcon,
  MailIcon,
  PhoneIcon,
  TelegramIcon,
  XIcon,
} from "@/components/Icons";
import type { Profile } from "@/lib/types";

export type Icon = (props: { className?: string }) => JSX.Element;

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** "https://github.com/alex" -> "@alex"; leaves handles and plain text alone. */
export function handleFromUrl(value: string) {
  const v = value.trim();
  if (!/^https?:\/\//i.test(v)) return v;
  try {
    const parts = new URL(v).pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last ? `@${last}` : new URL(v).hostname.replace(/^www\./, "");
  } catch {
    return v;
  }
}

export type ContactRow = { label: string; value: string; href?: string; Icon: Icon };

export function contactRows(p: Profile): ContactRow[] {
  const s = p.socials;
  const rows: (ContactRow | null)[] = [
    s.telegram
      ? {
          label: "Telegram",
          value: handleFromUrl(s.telegram).startsWith("@") ? handleFromUrl(s.telegram) : `@${s.telegram}`,
          href: /^https?:/i.test(s.telegram) ? s.telegram : `https://t.me/${s.telegram.replace(/^@/, "")}`,
          Icon: TelegramIcon,
        }
      : null,
    s.discord
      ? {
          label: "Discord",
          value: handleFromUrl(s.discord),
          href: /^https?:/i.test(s.discord) ? s.discord : undefined,
          Icon: ChatIcon,
        }
      : null,
    s.github ? { label: "GitHub", value: handleFromUrl(s.github), href: s.github, Icon: GithubIcon } : null,
    s.linkedin ? { label: "LinkedIn", value: handleFromUrl(s.linkedin), href: s.linkedin, Icon: LinkedinIcon } : null,
    s.twitter ? { label: "X / Twitter", value: handleFromUrl(s.twitter), href: s.twitter, Icon: XIcon } : null,
    s.website ? { label: "Website", value: handleFromUrl(s.website), href: s.website, Icon: GlobeIcon } : null,
    ...p.otherLinks
      .filter((l) => l.url.trim())
      .map((l) => ({ label: l.label || "Link", value: handleFromUrl(l.url), href: l.url, Icon: GlobeIcon })),
    p.phone ? { label: "Phone", value: p.phone, href: `tel:${p.phone.replace(/[^\d+]/g, "")}`, Icon: PhoneIcon } : null,
    p.email ? { label: "Email", value: p.email, href: `mailto:${p.email}`, Icon: MailIcon } : null,
  ];
  return rows.filter(Boolean) as ContactRow[];
}

