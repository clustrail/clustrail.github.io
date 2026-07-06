import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type {Props} from '@theme/Logo';

/**
 * Swizzled Logo: renders the swoosh mark plus the two-tone "Clus"+"trail"
 * wordmark, matching the hero. Docusaurus's default only supports a flat
 * text title, so the brand link is composed here instead.
 */
export default function Logo(props: Props): ReactNode {
  const {imageClassName, titleClassName, ...propsRest} = props;
  const homeUrl = useBaseUrl('/');
  const logoSrc = useBaseUrl('favicon.svg');
  return (
    <Link to={homeUrl} {...propsRest}>
      <img
        src={logoSrc}
        alt="Clustrail"
        className={imageClassName}
        width={26}
        height={26}
        draggable={false}
      />
      <b className={titleClassName}>
        <span className="text-primary">Clus</span>
        <span className="text-muted-foreground">trail</span>
      </b>
    </Link>
  );
}
