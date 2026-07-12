import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

/**
 * The docs content pipeline. Markdown lives in docs/ (unchanged from the
 * Docusaurus era); this module maps URL slugs to files, loads frontmatter,
 * and builds the hand-ordered navigation tree. All of it runs at build time
 * only (the site is statically exported).
 */

const DOCS_DIR = path.join(process.cwd(), 'docs');

export interface DocMeta {
  /** URL segments below /docs ([] for the docs landing page). */
  slug: string[];
  title: string;
  sidebarLabel: string;
  description?: string;
}

export interface Doc extends DocMeta {
  /** Raw markdown body (frontmatter stripped). */
  body: string;
  /** h2/h3 headings for the "On this page" rail. */
  headings: Array<{depth: 2 | 3; text: string; id: string}>;
  /** Slug of the directory holding the backing file - the base that the
      doc's relative links resolve against. */
  dirSlug: string[];
}

/**
 * Hand-ordered navigation, mirroring the old sidebars.ts. New pages must be
 * registered here explicitly so the reading order stays deliberate (intro ->
 * setup -> configuration -> features -> reference), rather than alphabetical.
 * Entries are slug paths below /docs; categories take their landing page
 * plus children.
 */
export const DOCS_NAV: Array<string | {category: string; items: string[]}> = [
  '',
  'quickstart',
  {category: 'installation', items: ['installation/local', 'installation/docker', 'installation/in-cluster']},
  'configuration',
  'updates',
  {category: 'authentication', items: ['authentication/oidc', 'authentication/proxy-auth', 'authentication/cluster-oidc']},
  'clusters',
  {category: 'features', items: [
    'features/overview',
    'features/resource-browser',
    'features/workspace',
    'features/logs',
    'features/events',
    'features/topology',
    'features/metrics',
    'features/nodes',
    'features/helm',
    'features/command-palette',
    'features/settings',
  ]},
  'faq',
];

/** Resolve slug segments to the markdown file backing them, or null. */
function docFile(slug: string[]): string | null {
  const rel = slug.join('/');
  const direct = path.join(DOCS_DIR, rel === '' ? 'index.md' : `${rel}.md`);
  if (fs.existsSync(direct)) return direct;
  const index = path.join(DOCS_DIR, rel, 'index.md');
  if (fs.existsSync(index)) return index;
  return null;
}

function slugFromPath(slugPath: string): string[] {
  return slugPath === '' ? [] : slugPath.split('/');
}

/** Every doc slug, in navigation order. */
export function allDocSlugs(): string[][] {
  const slugs: string[][] = [];
  for (const entry of DOCS_NAV) {
    if (typeof entry === 'string') {
      slugs.push(slugFromPath(entry));
    } else {
      slugs.push(slugFromPath(entry.category));
      for (const item of entry.items) slugs.push(slugFromPath(item));
    }
  }
  return slugs;
}

/** GitHub-style heading id, matching rehype-slug's output for our headings. */
function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Pull h2/h3 headings out of the markdown, skipping fenced code blocks. */
function extractHeadings(body: string): Doc['headings'] {
  const headings: Doc['headings'] = [];
  let inFence = false;
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const depth = m[1].length as 2 | 3;
    const text = m[2].replace(/`/g, '').replace(/\*\*/g, '');
    headings.push({depth, text, id: headingId(text)});
  }
  return headings;
}

/** Load one doc by slug, or null if it does not exist. */
export function getDoc(slug: string[]): Doc | null {
  const file = docFile(slug);
  if (!file) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const {data, content} = matter(raw);
  const isIndex = path.basename(file) === 'index.md';
  return {
    slug,
    dirSlug: isIndex ? slug : slug.slice(0, -1),
    title: (data.title as string) ?? slug[slug.length - 1] ?? 'Docs',
    sidebarLabel: (data.sidebar_label as string) ?? (data.title as string) ?? '',
    description: data.description as string | undefined,
    body: content,
    headings: extractHeadings(content),
  };
}

export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  href: string;
  items: NavItem[];
}

/** The rendered sidebar tree: labels from frontmatter, in DOCS_NAV order. */
export function docsNavTree(): Array<NavItem | NavGroup> {
  const item = (slugPath: string): NavItem => {
    const doc = getDoc(slugFromPath(slugPath));
    return {
      label: doc?.sidebarLabel || doc?.title || slugPath,
      href: slugPath === '' ? '/docs' : `/docs/${slugPath}`,
    };
  };
  return DOCS_NAV.map((entry) => {
    if (typeof entry === 'string') return item(entry);
    const landing = getDoc(slugFromPath(entry.category));
    return {
      // The group header carries the category's own title (e.g.
      // "Installation"), its landing page label ("Overview") appears within.
      label: landing?.title || entry.category,
      href: `/docs/${entry.category}`,
      items: [
        {label: landing?.sidebarLabel || 'Overview', href: `/docs/${entry.category}`},
        ...entry.items.map(item),
      ],
    };
  });
}

/**
 * Rewrite a relative `.md` link from the markdown source into its route.
 * `fileDirSlug` is the slug of the DIRECTORY holding the current doc's file
 * (for docs/installation/local.md that is ['installation']).
 */
export function resolveDocHref(fileDirSlug: string[], href: string): string {
  if (/^([a-z]+:|\/|#)/i.test(href)) return href; // external, absolute, or anchor
  const [target, hash = ''] = href.split('#');
  if (!/\.md$/.test(target)) return href;

  const parts = [...fileDirSlug];
  for (const seg of target.replace(/\.md$/, '').split('/')) {
    if (seg === '..') parts.pop();
    else if (seg !== '.' && seg !== '') parts.push(seg);
  }
  // index.md maps to its directory's route.
  if (parts[parts.length - 1] === 'index') parts.pop();
  const route = parts.length ? `/docs/${parts.join('/')}` : '/docs';
  return hash ? `${route}#${hash}` : route;
}
