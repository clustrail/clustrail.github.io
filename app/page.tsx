import type {ReactNode} from 'react';
import type {Metadata} from 'next';
import Hero from '@/components/landing/hero';
import {ResourceMarquee} from '@/components/landing/resource-marquee';
import {MetricsBand} from '@/components/landing/metrics-band';
import {WatchSection} from '@/components/landing/watch-section';
import FeatureShowcase from '@/components/landing/feature-showcase';
import {TrustSection} from '@/components/landing/trust-section';
import InstallSection from '@/components/landing/install-section';
import {Faq} from '@/components/landing/faq';
import {fetchReleases} from '@/lib/releases';
import {latestTag} from '@/lib/version';

export const metadata: Metadata = {
  alternates: {canonical: '/'},
};

export default async function Home(): Promise<ReactNode> {
  // The latest version comes from the committed changelog (falling back to
  // the API), never from the API alone - so the badge is correct on the
  // release commit's deploy regardless of when the GitHub release is
  // published.
  const releases = await fetchReleases();
  const latest = latestTag(releases);

  return (
    <main>
      <Hero latest={latest} />
      <ResourceMarquee />
      <MetricsBand />
      <WatchSection />
      <FeatureShowcase />
      <TrustSection />
      <InstallSection />
      <Faq />
    </main>
  );
}
