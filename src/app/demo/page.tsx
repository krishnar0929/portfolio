import type { Metadata } from "next";
import { Portfolio } from "@/components/portfolio/Portfolio";
import { sampleProfile } from "@/lib/sample";

export const metadata: Metadata = {
  title: `${sampleProfile.name} — ${sampleProfile.title} (demo)`,
  description: sampleProfile.tagline,
};

export default function DemoPage() {
  return <Portfolio profile={sampleProfile} />;
}
