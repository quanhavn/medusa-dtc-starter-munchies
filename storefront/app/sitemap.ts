import type { MetadataRoute } from 'next';

import config from "@/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes only
  return [
    {
      lastModified: new Date(),
      url: config.baseUrl,
    },
    {
      lastModified: new Date(),
      url: `${config.baseUrl}/products`,
    }
  ];
}