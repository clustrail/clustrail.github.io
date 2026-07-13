import type {CSSProperties, ReactNode} from 'react';
import {SectionHeader, StatusLabel} from '@/components/primitives';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {RevealSection} from '@/components/landing/reveal-section';

/**
 * 06 RBAC_UPSTREAM. The trust story: Clustrail holds no privilege of its own.
 * Three quiet cards, then the three identity modes as a hairline-separated row.
 */

const CARDS: Array<{status: string; title: string; body: string}> = [
  {
    status: 'NO_PRIVILEGED_TOKEN',
    title: 'No privileged token',
    body: 'The backend proxies every request with your own per-cluster credentials. There is no "see everything" service account behind it.',
  },
  {
    status: 'ENFORCED_UPSTREAM',
    title: 'RBAC enforced by the apiserver',
    body: 'Permissions are decided by Kubernetes, not by us. Forbidden is surfaced honestly as an error - never quietly escalated.',
  },
  {
    status: 'STATELESS',
    title: 'No database, no agents',
    body: 'State is your kubeconfig plus an in-memory watch cache rebuilt on startup. Nothing is installed in your cluster for desktop use.',
  },
];

const IDENTITY: Array<{label: string; line: string}> = [
  {label: 'LOCAL_KUBECONFIG', line: 'Your own contexts, exactly like kubectl.'},
  {label: 'SHARED_SERVICEACCOUNT', line: 'One team, the pod ServiceAccount, shared intentionally.'},
  {label: 'PER_USER_OIDC', line: 'Single sign-on, each user carrying their own RBAC.'},
];

export function TrustSection(): ReactNode {
  return (
    <RevealSection className="border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          index="06"
          kicker="Rbac_upstream"
          title="It cannot see more than you can"
          lede="Clustrail is a gateway, not an authority. Your credentials go upstream; the API server decides."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {CARDS.map((c, i) => (
            <Card
              key={c.title}
              className="reveal gap-3"
              style={{'--reveal-delay': `${i * 70}ms`} as CSSProperties}>
              <CardHeader>
                <StatusLabel>{c.status}</StatusLabel>
                <CardTitle className="mt-2">{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Identity triad. */}
        <div className="reveal mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {IDENTITY.map((m) => (
            <div key={m.label} className="flex flex-col gap-2 bg-card px-6 py-5">
              <StatusLabel>{m.label}</StatusLabel>
              <span className="text-sm text-muted-foreground">{m.line}</span>
            </div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
