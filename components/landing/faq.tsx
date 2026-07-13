import type {ReactNode} from 'react';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {SectionHeader} from '@/components/primitives';
import {RevealSection} from '@/components/landing/reveal-section';

/**
 * 08 FAQ. The questions that actually get asked, distilled from docs/faq.md.
 * Server component; the shadcn Accordion is the only interactive island inside.
 */

const FAQS: Array<{q: string; a: ReactNode}> = [
  {
    q: 'Is it open source?',
    a: 'Yes. Clustrail is licensed under AGPL-3.0-only, and the source and issue tracker live on GitHub.',
  },
  {
    q: 'How is it different from the archived Kubernetes Dashboard, Headlamp or Lens?',
    a: 'It is a different category of tool: one small self-contained binary you run locally, built around a watch-based data plane and a fully virtualized UI, with your own RBAC enforced upstream. It is not a desktop Electron app and not a cluster-side dashboard you install and expose.',
  },
  {
    q: 'Does it need anything installed in my cluster?',
    a: 'No. For desktop use it is a client of the Kubernetes API, like kubectl - point it at a kubeconfig and it works with zero cluster-side footprint. Deploying it in-cluster to share with a team is optional.',
  },
  {
    q: 'What permissions does it need?',
    a: 'Yours. Clustrail forwards your credentials to the API server on every request, and the API server enforces your RBAC. If a request would be forbidden for kubectl, it is forbidden here too.',
  },
  {
    q: 'Does it phone home?',
    a: 'No telemetry. The only outbound call is an optional anonymous update check - a static GET for the latest version - carrying no cluster data and no identifiers.',
  },
  {
    q: 'Does it scale to big clusters?',
    a: 'That is the point. The backend watches and streams only deltas instead of polling, and the frontend virtualizes every list, so a table renders only the rows on screen no matter how long the list is.',
  },
];

export function Faq(): ReactNode {
  return (
    <RevealSection className="py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-6">
        <SectionHeader align="left" kicker="Questions" title="Frequently asked" />

        <Accordion type="single" collapsible className="reveal mt-10">
          {FAQS.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="gap-4 py-4">
                <span className="text-[15px] font-medium text-foreground">{f.q}</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </RevealSection>
  );
}
