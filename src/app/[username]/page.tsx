import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Portfolio } from "@/components/portfolio/Portfolio";
import { getPublicProfile } from "@/lib/publicProfiles";

// Re-fetch published profiles at most every 30 seconds
export const revalidate = 30;

type Props = { params: { username: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getPublicProfile(params.username);
  if (!profile) return { title: "Profile not found" };

  const title = profile.title ? `${profile.name} — ${profile.title}` : profile.name;
  const description = profile.tagline || profile.about.slice(0, 160);
  return {
    title,
    description,
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
  return <Portfolio profile={profile} />;
}
