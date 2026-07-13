'use client';

import {useEffect, useState, type ReactNode} from 'react';
import {Star} from 'lucide-react';
import {GITHUB_URL, GithubMark} from '@/components/navbar';

/*
 * Hero social-proof badges: the GitHub star count and the Product Hunt page.
 * The star count is fetched client-side from the public GitHub API (the site
 * is a static export, so there is no server to proxy it); while the request
 * is in flight - or if it fails, e.g. rate-limited or the repo not yet
 * public - the badge still renders, just without a number. Chrome stays in
 * site tokens; only the Product Hunt cat mark keeps its brand color.
 */

const PRODUCT_HUNT_URL = 'https://www.producthunt.com/posts/clustrail';

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function useStarCount(): number | null {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('https://api.github.com/repos/clustrail/clustrail', {
      signal: controller.signal,
      headers: {Accept: 'application/vnd.github+json'},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (typeof data?.stargazers_count === 'number') setStars(data.stargazers_count);
      })
      .catch(() => {
        // Offline, rate-limited, or repo not public yet: keep the countless badge.
      });
    return () => controller.abort();
  }, []);
  return stars;
}

const BADGE =
  'inline-flex h-10 items-center gap-2.5 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground/90 no-underline transition-colors hover:border-input hover:text-foreground';

/** The Product Hunt cat mark, in its brand color. */
function ProductHuntMark({size = 18}: {size?: number}): ReactNode {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      <path
        fill="#DA552F"
        d="M40 20c0 11.046-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0s20 8.954 20 20"
      />
      <path
        fill="#fff"
        d="M22.667 20H17v-6h5.667a3 3 0 0 1 0 6m0-10H13v20h4v-6h5.667a7 7 0 1 0 0-14"
      />
    </svg>
  );
}

export default function HeroBadges(): ReactNode {
  const stars = useStarCount();
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={BADGE}>
        <GithubMark size={16} />
        Star on GitHub
        {stars !== null && (
          <span className="inline-flex items-center gap-1 border-l border-border pl-2.5 text-muted-foreground">
            <Star className="size-3.5" aria-hidden />
            <span className="tabular-nums">{formatStars(stars)}</span>
          </span>
        )}
      </a>
      <a href={PRODUCT_HUNT_URL} target="_blank" rel="noopener noreferrer" className={BADGE}>
        <ProductHuntMark size={16} />
        Find us on Product Hunt
      </a>
    </div>
  );
}
