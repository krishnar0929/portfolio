import type { MetadataRoute } from "next";

// Only the landing page and demo are crawlable; user profiles are shared by link only.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/$", "/demo"], disallow: ["/"] }],
  };
}
