import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // The site deploys as plain files to Cloudflare Pages: every route is
  // pre-rendered to static HTML at build time.
  output: 'export',
  // Cloudflare Pages resolves extensionless URLs to the matching .html file,
  // so the historical Docusaurus URL shape (/docs/quickstart, no trailing
  // slash) is preserved as-is.
  trailingSlash: false,
  images: {
    // next/image optimization needs a server; on Pages images are served
    // as-is (they are pre-sized screenshots).
    unoptimized: true,
  },
};

export default nextConfig;
