import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Hand-ordered docs sidebar. New pages must be registered here explicitly so
 * the reading order stays deliberate (intro -> setup -> configuration ->
 * features -> reference), rather than alphabetical autogeneration.
 */
const sidebars: SidebarsConfig = {
  docs: [
    'index',
    'quickstart',
    {
      type: 'category',
      label: 'Installation',
      link: {type: 'doc', id: 'installation/index'},
      items: [
        'installation/local',
        'installation/docker',
        'installation/in-cluster',
      ],
    },
    'configuration',
    {
      type: 'category',
      label: 'Authentication',
      link: {type: 'doc', id: 'authentication/index'},
      items: [
        'authentication/oidc',
        'authentication/proxy-auth',
        'authentication/cluster-oidc',
      ],
    },
    'clusters',
    {
      type: 'category',
      label: 'Features',
      link: {type: 'doc', id: 'features/index'},
      items: [
        'features/overview',
        'features/resource-browser',
        'features/workspace',
        'features/logs',
        'features/events',
        'features/topology',
        'features/metrics',
        'features/nodes',
        'features/helm',
        'features/command-palette',
        'features/settings',
      ],
    },
    'faq',
  ],
};

export default sidebars;
