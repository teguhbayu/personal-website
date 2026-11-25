import { MetadataRoute } from "next";
import { CHANNEL_ROUTES, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  return Object.entries(CHANNEL_ROUTES).map(([id, route]) => ({
    url: route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`,
    lastModified: now,
    priority: id === "home" ? 1 : 0.8,
    changeFrequency: "monthly",
  }));
}
