import type {ReactNode} from 'react';
import DocsSidebar from '@/components/docs/sidebar';
import {docsNavTree} from '@/lib/docs';

export default function DocsLayout({children}: {children: ReactNode}): ReactNode {
  const tree = docsNavTree();
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:py-14">
      <DocsSidebar tree={tree} />
      {children}
    </div>
  );
}
