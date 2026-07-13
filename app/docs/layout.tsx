import type {ReactNode} from 'react';
import DocsSidebar from '@/components/docs/sidebar';
import DocsSearch from '@/components/docs/search';
import {docsNavTree} from '@/lib/docs';

/**
 * Docs shell: a three-column reading grid - navigation rail (15rem), the
 * article, and (on xl, owned by the page) the "On this page" rail (13rem).
 * The left column pins the search trigger above a sticky nav rail; on mobile
 * both collapse to full-width controls above the article.
 */
export default function DocsLayout({children}: {children: ReactNode}): ReactNode {
  const tree = docsNavTree();
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
          <DocsSearch className="mb-3 w-full lg:mb-5" />
          <DocsSidebar tree={tree} />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
