import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/tools", "/pricing", "/api-docs", "/signup", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...tools.map((t) => ({ url: `${site.url}/tools/${t.slug}`, changeFrequency: "monthly" as const, priority: 0.9 })),
  ];
}
