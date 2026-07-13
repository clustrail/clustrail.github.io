'use client';

/*
 * Features slideshow. One feature at a time: title and one-liner above a large
 * browser-framed screenshot, arrows at the sides (hidden on touch widths -
 * swipe there) and dot indicators below. Loops, and auto-advances every few
 * seconds while on screen - pausing on hover, stopping entirely under reduced
 * motion, and resetting its timer whenever the visitor navigates manually.
 * The screenshots stay theme-paired via ThemedShot inside BrowserFrame.
 */
import {useEffect, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import {useInView} from '@/lib/use-in-view';
import {RevealSection} from '@/components/landing/reveal-section';
import {BrowserFrame} from '@/components/primitives';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

type Feature = {
  title: string;
  desc: string;
  /** /shots path stem; ThemedShot appends -dark/-light. */
  shot: string;
  alt: string;
  /** Address-strip path shown in the browser frame. */
  url: string;
};

const FEATURES: Feature[] = [
  {
    title: 'Cluster overview',
    desc: 'Health, capacity, and activity for the whole cluster on one screen.',
    shot: '/shots/overview',
    alt: 'Cluster overview screen with health, capacity and activity panels',
    url: 'localhost:8080/clusters/kind-clustrail/overview',
  },
  {
    title: 'Every resource, live',
    desc: 'Virtualized tables stream watch deltas: 10,000 rows at 60 fps.',
    shot: '/shots/pods',
    alt: 'Virtualized pods table streaming live watch updates',
    url: 'localhost:8080/clusters/kind-clustrail/pods',
  },
  {
    title: 'An IDE-style workspace',
    desc: 'Panes, tabs, YAML with diff, exec and logs that survive navigation.',
    shot: '/shots/detail',
    alt: 'Detail workspace with split panes, YAML editor and tabs',
    url: 'localhost:8080/clusters/kind-clustrail/pods',
  },
  {
    title: 'Logs across workloads',
    desc: 'One stream aggregating every pod, live, with search.',
    shot: '/shots/logs',
    alt: 'Aggregated live log stream across multiple pods',
    url: 'localhost:8080/clusters/kind-clustrail/logs',
  },
  {
    title: 'Events as they happen',
    desc: 'A live timeline instead of kubectl get events.',
    shot: '/shots/events',
    alt: 'Live timeline of cluster events',
    url: 'localhost:8080/clusters/kind-clustrail/events',
  },
  {
    title: 'The cluster as a graph',
    desc: 'Ownership and traffic relationships, laid out live.',
    shot: '/shots/topology',
    alt: 'Topology graph of workloads, services and config',
    url: 'localhost:8080/clusters/kind-clustrail/topology',
  },
  {
    title: 'Usage joined to requests',
    desc: 'CPU and memory against what you asked for.',
    shot: '/shots/metrics',
    alt: 'CPU and memory usage charts joined to requests and limits',
    url: 'localhost:8080/clusters/kind-clustrail/metrics',
  },
];

const AUTO_ADVANCE_MS = 5000;

export default function FeatureShowcase(): ReactNode {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stageRef, inView] = useInView<HTMLDivElement>({once: false, threshold: 0.35});

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // Auto-advance. Depending on `current` restarts the interval after every
  // slide change, so a manual arrow/dot/swipe gets a full dwell before the
  // loop moves on.
  useEffect(() => {
    if (!api || !inView || hovered) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => api.scrollNext(), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [api, inView, hovered, current]);

  return (
    <RevealSection className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="reveal flex flex-col items-center text-center">
          <span className="text-sm font-semibold text-primary">Features</span>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything your cluster is doing, on one surface
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Live watch data, virtualized tables, and a workspace that keeps YAML, logs, events,
            topology and metrics one click apart.
          </p>
        </div>

        <div
          ref={stageRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}>
          <Carousel setApi={setApi} opts={{loop: true}} className="reveal mt-12">
          <CarouselContent>
            {FEATURES.map((feature) => (
              <CarouselItem key={feature.shot}>
                <div className="mx-auto flex max-w-4xl flex-col gap-6">
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <h3 className="text-lg font-semibold text-primary">{feature.title}</h3>
                    <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>
                  <BrowserFrame
                    stem={feature.shot}
                    alt={feature.alt}
                    url={feature.url}
                    className="shadow-sm"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
            <CarouselPrevious className="hidden sm:inline-flex" />
            <CarouselNext className="hidden sm:inline-flex" />
          </Carousel>
        </div>

        {/* Dot indicators: one per feature, the active one stretched. */}
        <div className="mt-8 flex justify-center gap-2">
          {FEATURES.map((feature, i) => (
            <button
              key={feature.shot}
              type="button"
              aria-label={`Go to slide ${i + 1}: ${feature.title}`}
              aria-current={i === current}
              onClick={() => api?.scrollTo(i)}
              className={clsx(
                'h-1.5 rounded-full transition-all',
                i === current
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60',
              )}
            />
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
