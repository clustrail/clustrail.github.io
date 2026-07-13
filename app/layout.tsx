import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://clustrail.io'),
  title: {
    default: 'Clustrail - A Kubernetes UI on steroids',
    template: '%s | Clustrail',
  },
  description:
    'Clustrail is a Kubernetes UI on steroids: a fast, lightweight web UI served from a single self-contained Go binary. Watch-based, virtualized, and RBAC-respecting.',
  icons: {icon: '/favicon.svg'},
  openGraph: {
    siteName: 'Clustrail',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Clustrail - A Kubernetes UI on steroids',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clustrail - A Kubernetes UI on steroids',
    description:
      'Clustrail is a Kubernetes UI on steroids: a fast, lightweight web UI served from a single self-contained Go binary. Watch-based, virtualized, and RBAC-respecting.',
    images: ['/og.png'],
  },
};

/*
 * No-flash theme boot. Runs before first paint: an explicit stored choice is
 * stamped as data-theme so it beats the OS preference; with no stored choice
 * the attribute stays off and the prefers-color-scheme CSS decides. Kept as a
 * string so the static export inlines it untouched.
 */
const THEME_BOOT = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({children}: {children: ReactNode}): ReactNode {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1a1a1a" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fbfbfc" />
        <script dangerouslySetInnerHTML={{__html: THEME_BOOT}} />
      </head>
      <body className="flex min-h-screen flex-col bg-canvas font-sans text-foreground antialiased">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
