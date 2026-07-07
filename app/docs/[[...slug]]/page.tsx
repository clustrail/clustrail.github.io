import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {MDXRemote} from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import Toc from '@/components/docs/toc';
import {allDocSlugs, getDoc, resolveDocHref} from '@/lib/docs';

interface Props {
  params: Promise<{slug?: string[]}>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{slug?: string[]}> {
  // The docs landing page ([]) plus every registered page.
  return allDocSlugs().map((slug) => (slug.length ? {slug} : {slug: []}));
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug = []} = await params;
  const doc = getDoc(slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
  };
}

/** Per-doc MDX components: relative .md links resolve to their routes. */
function mdxComponents(dirSlug: string[]) {
  return {
    a: ({href = '', children, ...rest}: React.ComponentPropsWithoutRef<'a'>) => {
      const resolved = resolveDocHref(dirSlug, href);
      const external = /^[a-z]+:/i.test(resolved);
      return external ? (
        <a href={resolved} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      ) : (
        <Link href={resolved} {...rest}>
          {children}
        </Link>
      );
    },
    // Tables scroll inside their own container instead of the page.
    table: (props: React.ComponentPropsWithoutRef<'table'>) => (
      <div className="overflow-x-auto">
        <table {...props} />
      </div>
    ),
  };
}

export default async function DocPage({params}: Props): Promise<ReactNode> {
  const {slug = []} = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  return (
    <div className="grid min-w-0 gap-10 xl:grid-cols-[minmax(0,1fr)_13rem]">
      <article className="prose prose-invert docs-prose min-w-0 max-w-3xl prose-headings:scroll-mt-24">
        <h1 className="text-3xl font-semibold tracking-tight">{doc.title}</h1>
        <MDXRemote
          source={doc.body}
          components={mdxComponents(doc.dirSlug)}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [rehypePrettyCode, {theme: 'night-owl', keepBackground: false}],
              ],
            },
          }}
        />
      </article>

      <aside className="hidden xl:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <Toc headings={doc.headings} />
        </div>
      </aside>
    </div>
  );
}
