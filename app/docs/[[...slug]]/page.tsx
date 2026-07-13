import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {MDXRemote} from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import {ArrowLeft, ArrowRight} from 'lucide-react';
import Toc from '@/components/docs/toc';
import {ThemedShot} from '@/components/primitives';
import CodeBlock from '@/components/docs/code-block';
import {allDocSlugs, getDoc, resolveDocHref, DOCS_NAV} from '@/lib/docs';

interface Props {
  params: Promise<{slug?: string[]}>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{slug?: string[]}> {
  // The docs landing page ([]) plus every registered page.
  return allDocSlugs().map((slug) => (slug.length ? {slug} : {slug: []}));
}

function slugHref(slug: string[]): string {
  return slug.length ? `/docs/${slug.join('/')}` : '/docs';
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug = []} = await params;
  const doc = getDoc(slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
    alternates: {canonical: slug.length ? `/docs/${slug.join('/')}` : '/docs'},
  };
}

/**
 * The eyebrow over a page: the label of the nav group the doc belongs to
 * (e.g. "Installation", "Features"), or "Documentation" for a top-level page.
 */
function navGroupLabel(slug: string[]): string {
  const path = slug.join('/');
  for (const entry of DOCS_NAV) {
    if (typeof entry === 'string') continue;
    if (entry.category === path || entry.items.includes(path)) {
      return getDoc(entry.category.split('/'))?.title ?? entry.category;
    }
  }
  return 'Documentation';
}

/** Previous/next in the flattened DOCS_NAV reading order. */
function siblings(slug: string[]): {
  prev: {href: string; label: string} | null;
  next: {href: string; label: string} | null;
} {
  const flat = allDocSlugs();
  const key = slug.join('/');
  const i = flat.findIndex((s) => s.join('/') === key);
  const at = (s: string[] | undefined) =>
    s ? {href: slugHref(s), label: getDoc(s)?.sidebarLabel || getDoc(s)?.title || s.join('/')} : null;
  return {prev: i > 0 ? at(flat[i - 1]) : null, next: i >= 0 ? at(flat[i + 1]) : null};
}

/** Per-doc MDX components: relative .md links resolve to their routes. */
function mdxComponents(dirSlug: string[]) {
  return {
    // Product screenshots are committed as theme-paired -dark/-light siblings;
    // a bare `/shots/<name>.png` reference renders the pair and the CSS keeps
    // the one matching the visitor's theme visible. ThemedShot emits only
    // <img> elements, so it is valid inside the paragraph MDX wraps it in.
    img: ({src = '', alt = '', ...rest}: React.ComponentPropsWithoutRef<'img'>) => {
      const shot = typeof src === 'string' && src.match(/^\/shots\/([a-z0-9-]+)\.png$/);
      return shot ? (
        <ThemedShot
          stem={`/shots/${shot[1]}`}
          alt={alt}
          sizes="(max-width: 768px) 100vw, 768px"
          className="rounded-xl border border-border"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} {...rest} />
      );
    },
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
    // Highlighted code blocks get a copy button (client wrapper).
    pre: (props: React.ComponentPropsWithoutRef<'pre'>) => <CodeBlock {...props} />,
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

  const kicker = navGroupLabel(slug);
  const {prev, next} = siblings(slug);

  return (
    <div className="grid min-w-0 gap-12 xl:grid-cols-[minmax(0,1fr)_13rem]">
      <article className="prose docs-prose min-w-0 max-w-none prose-headings:scroll-mt-24">
        <header className="not-prose mb-10">
          <p className="text-sm font-semibold text-primary">{kicker}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {doc.title}
          </h1>
          {doc.description && (
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {doc.description}
            </p>
          )}
        </header>

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

        {(prev || next) && (
          <nav
            aria-label="Pagination"
            className="not-prose mt-16 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
            {prev ? (
              <Link
                href={prev.href}
                className="group flex flex-col gap-1 rounded-lg border border-border p-4 no-underline transition-colors hover:border-input">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <ArrowLeft className="size-3" /> Previous
                </span>
                <span className="text-sm font-medium text-foreground">{prev.label}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={next.href}
                className="group flex flex-col items-end gap-1 rounded-lg border border-border p-4 text-right no-underline transition-colors hover:border-input sm:col-start-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  Next <ArrowRight className="size-3" />
                </span>
                <span className="text-sm font-medium text-foreground">{next.label}</span>
              </Link>
            ) : (
              <span className="sm:col-start-2" />
            )}
          </nav>
        )}
      </article>

      <aside className="hidden xl:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <Toc headings={doc.headings} />
        </div>
      </aside>
    </div>
  );
}
