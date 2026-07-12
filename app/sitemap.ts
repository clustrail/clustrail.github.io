import type {MetadataRoute} from 'next';
import {allDocSlugs} from '@/lib/docs';

const BASE = 'https://clustrail.io';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = allDocSlugs().map((slug) => ({
    url: slug.length ? `${BASE}/docs/${slug.join('/')}` : `${BASE}/docs`,
  }));
  return [{url: `${BASE}/`}, {url: `${BASE}/changelog`}, ...docs];
}
