import type {CSSProperties, ReactNode} from 'react';
import {
  ArrowDown,
  ArrowRight,
  EyeOff,
  Fingerprint,
  FileKey2,
  KeyRound,
  Radar,
  ServerOff,
  ShieldCheck,
  Users,
  Waypoints,
} from 'lucide-react';
import {SectionHeader} from '@/components/primitives';
import {RevealSection} from '@/components/landing/reveal-section';

/*
 * The trust story: Clustrail holds no privilege of its own. The focal element
 * is a flow strip - your credentials travel through the gateway to the
 * apiserver, where RBAC decides. Below it, the three identity modes as a
 * hairline triad, then three quiet guarantees (no database, secrets masked,
 * no telemetry). Server component: the only interactivity is the shared
 * reveal.
 */

type FlowStage = {
  icon: typeof KeyRound;
  title: string;
  body: ReactNode;
};

const FLOW: FlowStage[] = [
  {
    icon: KeyRound,
    title: 'Your credentials',
    body: 'Every request starts with your identity - a kubeconfig context, a shared ServiceAccount, or an OIDC token.',
  },
  {
    icon: Waypoints,
    title: 'The gateway adds nothing',
    body: 'Clustrail proxies the request as you. It holds no privileged token and there is no "see everything" service account behind it.',
  },
  {
    icon: ShieldCheck,
    title: 'RBAC decides upstream',
    body: (
      <>
        Permissions are enforced by the Kubernetes API server, not by us. What you cannot see comes
        back as <span className="font-mono text-[0.85em] text-foreground">403 Forbidden</span> -
        never quietly escalated.
      </>
    ),
  },
];

const IDENTITY: Array<{icon: typeof KeyRound; label: string; line: string}> = [
  {
    icon: FileKey2,
    label: 'Local kubeconfig',
    line: 'Your own contexts, exactly like kubectl.',
  },
  {
    icon: Users,
    label: 'Shared ServiceAccount',
    line: 'One team, the pod ServiceAccount, shared intentionally.',
  },
  {
    icon: Fingerprint,
    label: 'Per-user OIDC',
    line: 'Single sign-on, each user carrying their own RBAC.',
  },
];

const GUARANTEES: Array<{icon: typeof KeyRound; title: string; body: string}> = [
  {
    icon: ServerOff,
    title: 'No database',
    body: 'State is your kubeconfig plus an in-memory watch cache rebuilt from the API server on startup. There is no datastore to run, back up, or clean out.',
  },
  {
    icon: EyeOff,
    title: 'Secrets masked by default',
    body: 'Secret values render masked and are revealed only on explicit action - and only when RBAC lets you read them at all.',
  },
  {
    icon: Radar,
    title: 'No telemetry',
    body: 'Clustrail never phones home. No usage analytics, no crash reporting, no tracking - what happens in your clusters stays between your browser and your clusters.',
  },
];

export function TrustSection(): ReactNode {
  return (
    <RevealSection className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          kicker="Security"
          title="It cannot see more than you can"
          lede="Clustrail is a gateway, not an authority. Your credentials go upstream; the API server decides."
        />

        {/* The credential flow: you -> gateway -> apiserver. */}
        <div className="reveal mt-14 rounded-xl border border-border bg-card/50 p-6 sm:p-8">
          <div className="grid items-stretch gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-5">
            {FLOW.map((stage, i) => (
              <div key={stage.title} className="contents">
                {i > 0 && (
                  <div aria-hidden className="flex items-center justify-center">
                    <ArrowRight className="hidden size-4 text-muted-foreground/50 md:block" />
                    <ArrowDown className="size-4 text-muted-foreground/50 md:hidden" />
                  </div>
                )}
                <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
                  <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-card">
                    <stage.icon className="size-4 text-primary" />
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">{stage.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{stage.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Identity triad: the three ways to carry that identity. */}
        <div className="reveal mt-6" style={{'--reveal-delay': '80ms'} as CSSProperties}>
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
            {IDENTITY.map((m) => (
              <div key={m.label} className="flex flex-col gap-1.5 bg-card px-6 py-5">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <m.icon className="size-4 text-muted-foreground" />
                  {m.label}
                </span>
                <span className="text-sm text-muted-foreground">{m.line}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Three identity modes; whichever you choose, RBAC is still enforced by the cluster.
          </p>
        </div>

        {/* Three standing guarantees. */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {GUARANTEES.map((g, i) => (
            <div
              key={g.title}
              className="reveal flex items-start gap-4 rounded-xl border border-border/60 bg-card px-6 py-5 transition-colors hover:border-border"
              style={{'--reveal-delay': `${160 + i * 70}ms`} as CSSProperties}>
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                <g.icon className="size-4 text-muted-foreground" />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-foreground">{g.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{g.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
