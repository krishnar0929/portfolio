import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Portfolio } from "@/components/portfolio/Portfolio";
import { getPublicProfile } from "@/lib/publicProfiles";

// Re-fetch published profiles at most every 30 seconds
export const revalidate = 30;

type Props = { params: { username: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getPublicProfile(params.username);
  if (!profile) return { title: "Profile not found", robots: { index: false, follow: false } };

  const title = profile.title ? `${profile.name} — ${profile.title}` : profile.name;
  const description = profile.tagline || profile.about.slice(0, 160);
  return {
    title,
    description,
    // Profiles are private-by-link: keep them out of search engines
    robots: { index: false, follow: false },
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
  const profile = await getPublicProfile(params.username);
  if (!profile) notFound();
  // Future: password protection — if profile.passwordProtected and the visitor has no
  // valid unlock cookie, render a password form here instead of the portfolio.
  return <Portfolio profile={profile} />;
}
