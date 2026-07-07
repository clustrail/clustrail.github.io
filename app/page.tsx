import type {ReactNode} from 'react';
import Hero from '@/components/landing/hero';
import Mission from '@/components/landing/mission';
import PerfPanel from '@/components/landing/perf-panel';
import FeatureShowcase from '@/components/landing/feature-showcase';
import InstallSection from '@/components/landing/install-section';
import FinalCta from '@/components/landing/final-cta';
import {fetchReleases} from '@/lib/releases';
import {latestTag} from '@/lib/version';

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
      <Mission />
      <PerfPanel />
      <FeatureShowcase />
      <InstallSection />
      <FinalCta />
    </main>
  );
}
