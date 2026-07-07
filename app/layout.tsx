import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://clustrail.github.io'),
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
  },
};

export default function RootLayout({children}: {children: ReactNode}): ReactNode {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-canvas font-sans text-foreground antialiased">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
