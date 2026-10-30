import type { Metadata } from "next";
import { Portfolio } from "@/components/portfolio/Portfolio";
import { sampleProfile } from "@/lib/sample";
import { fullName } from "@/lib/types";

export const metadata: Metadata = {
  title: `${fullName(sampleProfile)} — ${sampleProfile.title} (demo)`,
  description: sampleProfile.tagline,
};

export default function DemoPage() {
  return <Portfolio profile={sampleProfile} />;
}
