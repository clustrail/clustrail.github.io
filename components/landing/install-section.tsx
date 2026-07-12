'use client';

import {useState, type ReactNode} from 'react';
import clsx from 'clsx';
import {SectionHeader} from '@/components/primitives';
import {CopyButton} from '@/components/copy-button';

const CHANNELS = [
  {
    id: 'script',
    label: 'Script',
    command: 'curl -fsSL https://clustrail.io/install.sh | sh',
    hint: 'Detects your OS/arch, verifies the checksum, and installs to /usr/local/bin.',
  },
  {
    id: 'brew',
    label: 'Homebrew',
    command: 'brew install clustrail/tap/clustrail',
    hint: 'Installs from the Clustrail tap on macOS and Linux.',
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

/** One shell command in a copyable row. */
function CommandRow({command}: {command: string}): ReactNode {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-input bg-card/60 py-1.5 pl-4 pr-1.5">
      <span aria-hidden className="select-none font-mono text-sm text-link">
        $
      </span>
      <code className="flex-1 overflow-x-auto whitespace-nowrap px-2 py-1.5 font-mono text-[13px] text-foreground">
        {command}
      </code>
      <CopyButton text={command} />
    </div>
  );
}

function InstallTabs(): ReactNode {
  const [active, setActive] = useState(CHANNELS[0].id);
  const current = CHANNELS.find((c) => c.id === active) ?? CHANNELS[0];
  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label="Install channels"
        className="inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-border bg-card/60 p-1">
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active === c.id}
            onClick={() => setActive(c.id)}
            className={clsx(
              'inline-flex h-8 shrink-0 cursor-pointer items-center rounded-md px-3.5',
              'text-sm font-medium transition-colors',
              active === c.id
                ? 'bg-primary text-primary-foreground'
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

/** Titled code card for the example config. */
function CodeCard({code, filename}: {code: string; filename: string}): ReactNode {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex h-11 items-center justify-between border-b border-border bg-background/80 pl-4 pr-1.5">
        <span className="font-mono text-xs text-muted-foreground">{filename}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-card-foreground">
        {code}
      </pre>
    </div>
  );
}

export default function InstallSection(): ReactNode {
  return (
    <section id="install" className="scroll-mt-20 border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-6">
        <SectionHeader
          align="left"
          kicker="Install"
          title="Get Clustrail"
          lede="Grab a release binary, run the container image, or deploy the Helm chart. It reads whatever contexts already exist in your kubeconfig."
        />
        <div className="mt-8">
          <InstallTabs />
        </div>

        <div className="mt-14">
          <SectionHeader
            align="left"
            kicker="Configure"
            title="One config, everywhere"
            lede={
              <>
                The same schema for local and production. Point the server at it with{' '}
                <code className="rounded-[4px] border border-border bg-white/5 px-1.5 py-0.5 font-mono text-[13px] text-foreground">
                  clustrail serve --config config.yaml
                </code>
                , or let the Helm chart render it into a ConfigMap.
              </>
            }
          />
          <div className="mt-8">
            <CodeCard code={CONFIG_YAML} filename="config.yaml" />
          </div>
        </div>
      </div>
    </section>
  );
}
