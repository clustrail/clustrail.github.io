'use client';

/*
 * The one IntersectionObserver hook behind the whole animation system:
 * scroll reveals, metric count-ups, and pausing the diagram/stream loops
 * off-viewport. Content must always render visible-first - in-view state
 * only ENHANCES (see the .reveal rules in globals.css).
 */
import {useEffect, useRef, useState} from 'react';

export interface UseInViewOptions {
  /** Fire once and stay true (reveals, count-ups) vs track continuously (loops). */
  once?: boolean;
  /** How much of the element must be visible before firing. */
  threshold?: number;
  rootMargin?: string;
}

export function useInView<T extends HTMLElement>({
  once = true,
  threshold = 0.2,
  rootMargin = '0px',
}: UseInViewOptions = {}): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No IO (very old browsers): treat as visible, never gate content.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) io.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      {threshold, rootMargin},
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold, rootMargin]);

  return [ref, inView];
}
