import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrivateGate } from "@/components/portfolio/PrivateGate";
import { Portfolio } from "@/components/portfolio/Portfolio";
import { getProfileView } from "@/lib/publicProfiles";
import { fullName } from "@/lib/types";

// Re-fetch at most every 30 seconds
export const revalidate = 30;

type Props = { params: { username: string } };

// Profiles are shared by link: keep all of them out of search engines
const robots = { index: false, follow: false };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const view = await getProfileView(params.username);
  if (!view) return { title: "Profile not found", robots };

  // Private: reveal nothing beyond the handle
  if (view.kind === "private") {
    return { title: `@${view.username} · Private profile`, robots };
  }

  const profile = view.profile;
  const name = fullName(profile) || profile.username;
  const title = profile.title ? `${name} — ${profile.title}` : name;
  const description = profile.tagline || profile.about.slice(0, 160);
  return {
    title,
    description,
    robots,
    alternates: { canonical: `/${profile.username}` },
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/${profile.username}`,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : undefined,
    },
    twitter: {
      card: profile.avatarUrl ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const view = await getProfileView(params.username);
  if (!view) notFound();
  if (view.kind === "private") return <PrivateGate uid={view.uid} username={view.username} hasPassword={view.hasPassword} />;
  return <Portfolio profile={view.profile} />;
}
