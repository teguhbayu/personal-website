import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://teguhbayu.xyz/",
      lastModified: new Date().toISOString(),
      priority: 1,
      changeFrequency: "yearly",
    },
  ];
}
