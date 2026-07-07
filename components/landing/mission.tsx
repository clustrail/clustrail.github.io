import type {ReactNode} from 'react';

/**
 * The mission strip: a three-word thesis and one sentence of mission,
 * centered on the bare canvas between the hero and the first panel.
 */
export default function Mission(): ReactNode {
  return (
    <section className="border-t border-border/60 py-20 sm:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Fast, light, live.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          Clustrail exists to make cluster operations feel instant: live watch streams instead of
          polling, a UI that never renders more than you can see, and your own RBAC enforced by
          the API server itself.
        </p>
      </div>
    </section>
  );
}
