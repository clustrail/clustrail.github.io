import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Hero from '@site/src/components/site/Hero';
import FeatureShowcase from '@site/src/components/site/FeatureShowcase';
import InstallSection from '@site/src/components/site/InstallSection';
import FinalCta from '@site/src/components/site/FinalCta';

export default function Home(): ReactNode {
  return (
    <Layout
      title="Clustrail - A Kubernetes UI on steroids"
      description="Clustrail is a fast, lightweight web UI for Kubernetes, served from a single self-contained Go binary. Watch-based, virtualized, and RBAC-respecting.">
      <main className="clustrail-landing bg-canvas">
        <Hero />
        <FeatureShowcase />
        <InstallSection />
        <FinalCta />
      </main>
    </Layout>
  );
}
