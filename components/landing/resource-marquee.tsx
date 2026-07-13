import type {CSSProperties, ReactNode} from 'react';

/**
 * Decorative marquee of the resource types Clustrail speaks - every one served
 * by the single generic resource path. Mono names with tiny k8s-style colored
 * dots, scrolling in a seamless loop (the track holds two copies) and masked at
 * both edges. aria-hidden: it is texture, not content.
 */

// A small, mid-saturation palette that reads on both the near-black and the
// near-white canvas - no token needed, these are fixed accent hues.
const DOT = [
  '#326ce5', // blue
  '#22a06b', // green
  '#e0a400', // amber
  '#8b5cf6', // violet
  '#0ea5b7', // teal
  '#e0526e', // rose
];

const RESOURCES = [
  'Pods',
  'Deployments',
  'StatefulSets',
  'DaemonSets',
  'Jobs',
  'CronJobs',
  'Services',
  'Ingresses',
  'ConfigMaps',
  'Secrets',
  'PVCs',
  'HPAs',
  'Nodes',
  'Namespaces',
  'RBAC',
  'CRDs',
];

function Item({name, index}: {name: string; index: number}): ReactNode {
  return (
    <span className="flex shrink-0 items-center gap-2 px-5 font-mono text-sm text-muted-foreground">
      <span
        aria-hidden
        className="size-1.5 rounded-full"
        style={{backgroundColor: DOT[index % DOT.length]} as CSSProperties}
      />
      {name}
    </span>
  );
}

export function ResourceMarquee(): ReactNode {
  return (
    <div aria-hidden className="mask-fade-x marquee overflow-hidden border-y border-border/60 py-4">
      <div className="marquee-track flex w-max">
        {/* Two identical copies so the -50% loop is seamless. */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {RESOURCES.map((name, i) => (
              <Item key={`${copy}-${name}`} name={name} index={i} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
