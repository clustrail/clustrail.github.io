import type {ReactNode, CSSProperties} from 'react';
import type {Metadata} from 'next';
import {Rss, PencilLine, ShieldCheck} from 'lucide-react';
import {SectionHeader, CtaButton} from '@/components/primitives';
import {StatTile} from '@/components/stat-tile';
import {Card} from '@/components/ui/card';
import {RevealSection} from '@/components/landing/reveal-section';
import {ArchitectureDiagram} from '@/components/architecture/architecture-diagram';

export const metadata: Metadata = {
  title: 'Architecture',
  description:
    'How Clustrail works: a single Go binary that serves an embedded SPA and streams watch deltas from your clusters over one multiplexed WebSocket, enforcing RBAC upstream.',
  alternates: {canonical: '/architecture'},
};

/* 02 - the pieces that make the data plane work, each a package in the binary. */
const COMPONENTS: Array<{title: string; pkg: string; body: string}> = [
  {
    title: 'The WebSocket multiplexer',
    pkg: 'internal/multiplexer',
    body: 'The browser opens exactly one /ws. Every list and detail view multiplexes over it via a subscription key of the form clusterId|gvr|namespace|selectorHash. The backend ref-counts a single server-side subscription and fans each informer delta out to every socket that shares the key.',
  },
  {
    title: 'Dynamic shared informers',
    pkg: 'internal/watch',
    body: 'Dynamic shared informers over unstructured objects hold the authoritative watch cache in process, one set per cluster. A SetTransform strips managedFields before anything is cached, and idle informers stop on tiered timeouts, so memory tracks what is actually being watched.',
  },
  {
    title: 'The generic resource registry',
    pkg: 'internal/resources',
    body: 'Every resource is one declarative entry: a GVR plus a table-projection function. A single code path serves core types and CRDs alike, so adding a type is a registry line and its columns rather than new plumbing, and CRDs are discovered from the cluster.',
  },
  {
    title: 'The authenticating reverse proxy',
    pkg: 'internal/proxy',
    body: 'Reads and writes proxy through httputil.ReverseProxy over a per-identity transport built with rest.TransportFor. Your own token goes upstream on every request, so the gateway carries no ambient privilege of its own and cannot see more than you can.',
  },
  {
    title: 'Stale-while-revalidate memoizers',
    pkg: 'internal/rbac',
    body: 'Discovery, access reviews, metrics, and topology are costly to recompute and safe to reuse briefly. Each sits behind a stale-while-revalidate memoizer that serves the last value instantly and refreshes in the background, so a warm UI never blocks waiting on them.',
  },
  {
    title: 'The metrics joiner',
    pkg: 'internal/metrics',
    body: 'The single sanctioned poll. Because metrics.k8s.io is an aggregated, list-only API with no watch verb, node and pod usage is joined to allocatable and requests from the warm caches, memoized on a short TTL, and polled on a roughly 12-second cadence. Nothing else polls.',
  },
];

/* 03 - the two flows through the binary, told as ordered steps. */
const READ_PATH: Array<{k: string; body: string}> = [
  {k: 'Subscribe', body: 'A view opens a subscription key on the one socket - clusterId, GVR, namespace, and a selector hash.'},
  {k: 'The informer syncs once', body: 'The server ref-counts a single shared informer for that key and lets it list, then watch, exactly once.'},
  {k: 'Snapshot', body: 'The current cache contents stream down as the initial set - the only bulk transfer in the whole session.'},
  {k: 'Deltas stream', body: 'Every later change arrives as a delta over the same socket. There is no re-list and no polling after the snapshot.'},
];

const WRITE_PATH: Array<{k: string; body: string}> = [
  {k: 'Action', body: 'You trigger an edit, a scale, a cordon, or a delete from the UI.'},
  {k: 'The UI is gated by a review', body: 'A SelfSubjectAccessReview decides whether the control is even enabled - the UI never offers what you cannot do.'},
  {k: 'The apiserver enforces RBAC', body: 'The write proxies upstream with your credentials, and Kubernetes itself allows or forbids it. Our code never adjudicates.'},
  {k: 'The watch delta confirms', body: 'The resulting change returns through the same watch stream, so the list you are looking at updates itself.'},
];

const LIFECYCLE = [
  {
    title: 'Read path',
    tagline: 'How data reaches your screen.',
    icon: Rss,
    steps: READ_PATH,
    outcome: {
      live: true,
      text: 'Live from here on - only deltas cross the wire.',
    },
  },
  {
    title: 'Write path',
    tagline: 'How a change confirms itself.',
    icon: PencilLine,
    steps: WRITE_PATH,
    outcome: {
      live: false,
      text: 'RBAC enforced upstream on every write.',
    },
  },
];

/* 04 - the eight load-bearing decisions, curated from the repo's ARCHITECTURE.md. */
const DECISIONS: Array<{title: string; why: string}> = [
  {
    title: 'One WebSocket, many logical subscriptions',
    why: 'The browser opens exactly one /ws. Every list and detail view multiplexes over it via a subscription key of the form clusterId|gvr|namespace|selectorHash, and the backend ref-counts a single server-side subscription across all interested sockets. One connection, fanned out, keeps the wire quiet and the server bookkeeping honest.',
  },
  {
    title: 'Server is the cache; client is a projection',
    why: 'Dynamic shared informers hold the authoritative watch cache in-process on the server. The browser store is a thin normalized projection of only what is currently subscribed. There is no polling and no full re-list over the wire after the initial snapshot.',
  },
  {
    title: 'Watch, never poll',
    why: 'Lists and anything live flow through the WebSocket plus informer path. React Query is used only for point reads, writes, and computed endpoints, never to poll a list. The one sanctioned poll is metrics.k8s.io, an aggregated list-only API with no watch verb. Adding polling anywhere the watch path can serve is an architectural regression.',
  },
  {
    title: 'Cluster is a key, never an assumption',
    why: 'Every entity, request, subscription, and cache row is keyed by cluster; code must never assume a single one. Cluster names are sanitized into IDs - lower-case [a-z0-9-] plus a short hash of the original name - before they touch any URL path, WebSocket key, or cache key, to prevent collisions and path traversal.',
  },
  {
    title: 'RBAC is never in our code',
    why: 'The backend lists and proxies using your own per-cluster credentials, and the API server enforces RBAC. Forbidden resources surface as error frames, never as an escalation. There is no privileged see-everything token anywhere in the design.',
  },
  {
    title: 'Generic resource path',
    why: 'Resources are described declaratively in a registry: a GVR plus a table-projection function. The backend uses dynamic informers over unstructured, so one code path serves every core type and CRDs alike, rather than one hand-wired typed informer per resource. Adding a resource type is a registry entry plus columns, not new plumbing.',
  },
  {
    title: 'Single static binary',
    why: 'The built SPA is embedded into the Go binary via go:embed. A !dev build tag embeds the dist directory; a dev build tag reverse-proxies to the Vite dev server, so dev and prod share one origin and the /ws upgrade behaves identically in both. The embed directory must contain a real build at compile time, which is why the build is hard-ordered and plain go install cannot produce a working binary.',
  },
  {
    title: 'No database',
    why: 'The backend is a gateway, not a datastore. State is the kubeconfig on disk, the in-memory watch cache rebuilt from each API server on startup, and browser-side UI preferences. If durable server-side state ever became unavoidable, the only acceptable option is an embedded pure-Go store compiled into the one binary, never an external database server.',
  },
];

/* 05 - the receipts. Real measured figures with their honest conditions. */
const RECEIPTS: Array<{
  value: number;
  decimals?: number;
  prefix?: string;
  suffix: string;
  label: string;
  sublabel: string;
}> = [
  {value: 8, prefix: '<', suffix: 'ms', label: 'Watch delta applied', sublabel: 'budget · 10,000-row table'},
  {value: 1.5, decimals: 1, suffix: 'ms', label: 'Subscribe to snapshot', sublabel: 'measured · warm informer cache'},
  {value: 60, suffix: 'fps', label: '10,000-row tables', sublabel: 'only visible rows in the DOM'},
  {value: 49, suffix: 'MB', label: 'Backend idle RSS', sublabel: 'one cluster · budget 80 MB'},
];

function LifecycleCard({flow}: {flow: (typeof LIFECYCLE)[number]}): ReactNode {
  return (
    <Card className="flex flex-col p-6 sm:p-7">
      {/* Card header: icon tile, name, one-line summary. */}
      <div className="flex items-center gap-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
          <flow.icon className="size-[1.125rem] text-primary" aria-hidden />
        </span>
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-foreground">{flow.title}</h3>
          <span className="text-xs text-muted-foreground">{flow.tagline}</span>
        </div>
      </div>

      {/* Numbered steps on a connector rail. */}
      <ol className="relative m-0 mt-7 flex flex-1 list-none flex-col gap-7 p-0">
        <span
          aria-hidden
          className="absolute bottom-4 left-[0.8125rem] top-4 w-px bg-border"
        />
        {flow.steps.map((s, i) => (
          <li
            key={s.k}
            className="reveal relative pl-11"
            style={{'--reveal-delay': `${i * 90}ms`} as CSSProperties}>
            <span
              aria-hidden
              className="absolute left-0 top-0 flex size-[1.625rem] items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-primary tabular-nums">
              {i + 1}
            </span>
            <span className="text-sm font-medium text-foreground">{s.k}</span>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>

      {/* Where the flow lands. Green stays reserved for the live watch signal. */}
      <div className="mt-7 flex items-center gap-2.5 rounded-lg border border-border bg-background/60 px-4 py-3">
        {flow.outcome.live ? (
          <span className="relative flex size-1.5 shrink-0" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-live" />
          </span>
        ) : (
          <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
        )}
        <span className="text-xs font-medium text-foreground/80">{flow.outcome.text}</span>
      </div>
    </Card>
  );
}

export default function ArchitecturePage(): ReactNode {
  return (
    <main>
      {/* 01 - hero + the full diagram. */}
      <section className="border-b border-border pb-16 pt-16 sm:pb-24 sm:pt-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            kicker="Architecture"
            title="A gateway, not a middleman."
            lede="Clustrail is one Go binary that serves an embedded React SPA and proxies to your clusters with your own credentials. The data plane watches, never polls: informers keep a warm cache next to each API server, and only deltas cross the wire."
            align="left"
          />
          <div className="mt-14">
            <ArchitectureDiagram variant="full" />
          </div>
        </div>
      </section>

      {/* 02 - the component breakdown. */}
      <section className="border-b border-border py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            kicker="Components"
            title="Six pieces in one binary."
            lede="Each of these is a package that ships inside the single executable. None of them holds state you cannot rebuild from the cluster."
            align="left"
          />
          <div className="mt-12 flex flex-col gap-4">
            {COMPONENTS.map((c) => (
              <Card key={c.pkg} className="p-6 sm:p-7">
                <div className="grid gap-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-foreground">{c.title}</span>
                    <span className="font-mono text-2xs text-link">{c.pkg}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 03 - the two lifecycle walkthroughs. */}
      <RevealSection className="border-b border-border py-16 sm:py-24" threshold={0.1}>
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            kicker="Lifecycle"
            title="Read and write, end to end."
            lede="Two flows tell the whole story: how data reaches your screen, and how a change you make comes back to confirm itself."
            align="left"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {LIFECYCLE.map((flow) => (
              <LifecycleCard key={flow.title} flow={flow} />
            ))}
          </div>
        </div>
      </RevealSection>

      {/* 04 - the eight decisions in full. */}
      <section className="border-b border-border py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            kicker="Decisions"
            title="Eight load-bearing decisions."
            lede="These span multiple packages and are easy to violate by accident. They are finalized: where the code drifts from them, the code is the bug."
            align="left"
          />
          <ol className="mt-12 flex list-none flex-col p-0">
            {DECISIONS.map((d, i) => (
              <li
                key={d.title}
                className={
                  i === 0
                    ? 'py-7 first:pt-0'
                    : 'border-t border-border py-7 last:pb-0'
                }>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,3rem)_1fr] sm:gap-8">
                  <span className="text-sm font-semibold text-primary tabular-nums">{i + 1}</span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{d.title}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {d.why}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 05 - performance receipts. */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            kicker="Performance"
            title="The budgets are real."
            lede="These are not marketing numbers. The frame, delta, and memory figures are CI gates on every change, measured against a local kind cluster."
            align="left"
          />
          <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {RECEIPTS.map((r) => (
              <StatTile
                key={r.label}
                value={r.value}
                decimals={r.decimals}
                prefix={r.prefix}
                suffix={r.suffix}
                label={r.label}
                sublabel={r.sublabel}
              />
            ))}
          </div>
          <p className="mt-12 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Method: figures are taken against the local three-node kind cluster the project
            develops on. A change that ships over a runtime budget is not done - it is raised as a
            tradeoff, not merged.
          </p>

          <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaButton to="/#install" variant="primary">
              Get started
            </CtaButton>
            <CtaButton to="/docs" variant="outline">
              Read the docs
            </CtaButton>
          </div>
        </div>
      </section>
    </main>
  );
}
