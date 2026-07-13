'use client';

/*
 * Two-state theme toggle for the static export. The initial (unset) state
 * means "follow the OS"; the first click stores an explicit choice in
 * localStorage and stamps data-theme, which the CSS lets win over the
 * prefers-color-scheme block. The no-flash boot script in app/layout.tsx
 * replays the stored choice before first paint.
 */
import {useEffect, useState} from 'react';
import {Moon, Sun} from 'lucide-react';
import {Button} from '@/components/ui/button';

type Resolved = 'dark' | 'light';

function resolveCurrent(): Resolved {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function ThemeToggle(): React.ReactNode {
  // null until mounted: SSR markup shows the moon (the dark default paint);
  // the first effect corrects it for OS-light visitors before they interact.
  const [current, setCurrent] = useState<Resolved | null>(null);

  useEffect(() => {
    setCurrent(resolveCurrent());
  }, []);

  const flip = () => {
    const next: Resolved = resolveCurrent() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Private mode: the choice just lives for this page view.
    }
    setCurrent(next);
  };

  const light = current === 'light';
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={flip}
      aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {light ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </Button>
  );
}
