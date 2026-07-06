import {useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import {Check, Copy} from 'lucide-react';

/* ------------------------------------------------------------------ data */

const INSTALL_CHANNELS = [
  {
    id: 'script',
    label: 'Script',
    command: 'curl -fsSL https://clustrail.github.io/install.sh | sh',
    hint: 'Detects your OS/arch, verifies the checksum, and installs to /usr/local/bin.',
  },
  {
    id: 'brew',
    label: 'Homebrew',
    command: 'brew install clustrail/tap/clustrail',
    hint: 'Installs from the clustrail tap on macOS and Linux.',
  },
  {
    id: 'docker',
    label: 'Docker',
    command:
      'docker run --rm -p 8080:8080 -v ~/.kube:/home/nonroot/.kube:ro ghcr.io/clustrail/clustrail:latest',
    hint: 'Runs the multi-arch image, mounting your kubeconfig read-only.',
  },
  {
    id: 'helm',
    label: 'Helm',
    command: 'helm install clustrail oci://ghcr.io/clustrail/charts/clustrail',
    hint: 'Deploys in-cluster from the OCI chart.',
  },
];

const CONFIG_YAML = `# clustrail config. Precedence: flag > CLUSTRAIL_* env > file > default.
addr: ":8080"

# Identity mode: auto | local | shared-sa | per-user
identity-mode: auto

# Optional OIDC single sign-on (per-user mode); empty issuer disables it.
oidc:
  issuer: ""
  client-id: ""
  redirect-url: ""`;

/* ------------------------------------------------------------ primitives */

function useCopy(text: string): [boolean, () => void] {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return [copied, copy];
}

function CopyButton({text, className}: {text: string; className?: string}): ReactNode {
  const [copied, copy] = useCopy(text);
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy to clipboard"
      className={clsx(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-md',
        'text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        className,
      )}>
      {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
    </button>
  );
}

/** One shell command in a copyable row. */
function CommandRow({command}: {command: string}): ReactNode {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card py-1.5 pl-4 pr-1.5">
      <span aria-hidden className="select-none font-mono text-sm text-primary">
        $
      </span>
      <code className="flex-1 overflow-x-auto whitespace-nowrap bg-transparent px-2 py-1.5 font-mono text-sm text-card-foreground">
        {command}
      </code>
      <CopyButton text={command} />
    </div>
  );
}

/** Multi-line code in a titled card. */
function CodeCard({code, filename}: {code: string; filename: string}): ReactNode {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex h-11 items-center justify-between border-b border-border pl-4 pr-1.5">
        <span className="font-mono text-xs text-muted-foreground">{filename}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto bg-transparent p-4 font-mono text-[13px] leading-relaxed text-card-foreground">
        {code}
      </pre>
    </div>
  );
}

/** Segmented control + command row for the install channels. */
function InstallTabs(): ReactNode {
  const [active, setActive] = useState(INSTALL_CHANNELS[0].id);
  const current = INSTALL_CHANNELS.find((c) => c.id === active) ?? INSTALL_CHANNELS[0];
  return (
    <div className="flex flex-col gap-3">
      <div className="inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-border bg-muted/60 p-1">
        {INSTALL_CHANNELS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={clsx(
              'inline-flex h-7 shrink-0 items-center rounded-md px-3.5 text-sm font-medium transition-colors',
              active === c.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}>
            {c.label}
          </button>
        ))}
      </div>
      <CommandRow command={current.command} />
      <p className="text-sm text-muted-foreground">{current.hint}</p>
    </div>
  );
}

/** Section shell: kicker, title, lede, content - shared rhythm for the page. */
function Section({
  id,
  kicker,
  title,
  lede,
  children,
}: {
  id?: string;
  kicker: string;
  title: string;
  lede: ReactNode;
  children: ReactNode;
}): ReactNode {
  return (
    <section id={id} className="border-t border-border/60">
      <div className="mx-auto flex max-w-2xl flex-col px-6 py-16">
        <span className="text-2xs font-medium uppercase tracking-widest text-primary">
          {kicker}
        </span>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{lede}</p>
        <div className="mt-7">{children}</div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ page */

export default function Home(): ReactNode {
  return (
    <Layout
      title="Clustrail - A Kubernetes UI on steroids"
      description="Clustrail is a fast, lightweight web UI for Kubernetes, served from a single self-contained Go binary. Watch-based, virtualized, and RBAC-respecting.">
      <main className="clustrail-landing relative bg-canvas">
        {/* Soft brand glow behind the hero; purely decorative. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-105 bg-[radial-gradient(ellipse_60%_80%_at_50%_-20%,rgba(50,108,229,0.18),transparent)]"
        />

        {/* Hero */}
        <section className="relative">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-6 pb-24 pt-24 text-center sm:pt-32">
            <div className="flex items-center gap-3">
              <img
                src="/favicon.svg"
                alt=""
                width={44}
                height={44}
                className="size-11"
                draggable={false}
              />
              <span className="text-[2.75rem] font-semibold leading-none tracking-tight">
                <span className="text-primary">Clus</span>
                <span className="text-muted-foreground">trail</span>
              </span>
            </div>
            <h1 className="text-xl font-medium text-foreground sm:text-2xl">
              A Kubernetes UI on steroids.
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              One self-contained Go binary serves an embedded React app and acts as an
              authenticating gateway to your clusters. Watch-based and virtualized, so even huge
              clusters stay instant - and your own RBAC is enforced upstream.
            </p>
          </div>
        </section>

        <Section
          id="install"
          kicker="Install"
          title="Get Clustrail"
          lede="Grab a release binary, run the container image, or deploy the Helm chart.">
          <InstallTabs />
        </Section>

        <Section
          kicker="Configure"
          title="Example config"
          lede={
            <>
              One schema for local and production. Point the server at it with{' '}
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">
                clustrail serve --config config.yaml
              </code>
              , or let the Helm chart render it into a ConfigMap.
            </>
          }>
          <CodeCard code={CONFIG_YAML} filename="config.yaml" />
        </Section>
      </main>
    </Layout>
  );
}
