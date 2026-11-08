import type { Metadata } from "next";
import { Portfolio } from "@/components/portfolio/Portfolio";
import { sampleProfile } from "@/lib/sample";
import { fullName } from "@/lib/types";

export const metadata: Metadata = {
  title: `${fullName(sampleProfile)} — ${sampleProfile.title} (demo)`,
  description: sampleProfile.tagline,
};

/** /demo shows the Classic layout; /demo?layout=cinema shows Cinema. */
export default function DemoPage({ searchParams }: { searchParams: { layout?: string } }) {
  const cinema = searchParams.layout === "cinema";
  const profile = cinema ? { ...sampleProfile, layout: "cinema" as const, accent: "#e50914" } : sampleProfile;
  return <Portfolio profile={profile} />;
}
