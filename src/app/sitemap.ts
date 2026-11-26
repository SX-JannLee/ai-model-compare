import type { MetadataRoute } from "next";
import { models } from "@/data/models";
import { SITE, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

const lastModified = new Date(SITE.dataDate);

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: absoluteUrl("/models/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/compare/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/benchmarks/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/news/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const modelPages: MetadataRoute.Sitemap = models.map((model) => ({
    url: absoluteUrl(`/models/${model.slug}/`),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...pages, ...modelPages];
}