import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import tailwindPostcss from '@tailwindcss/postcss';

// This runs in Node.js - don't use client-side code here.

// Wire Tailwind v4 into Docusaurus's PostCSS pipeline.
function tailwindPlugin() {
  return {
    name: 'tailwind-plugin',
    configurePostCss(postcssOptions: {plugins: unknown[]}) {
      postcssOptions.plugins.push(tailwindPostcss());
      return postcssOptions;
    },
  };
}

const config: Config = {
  title: 'Clustrail',
  tagline: 'A Kubernetes UI on steroids.',
  favicon: 'favicon.svg',

  url: 'https://clustrail.github.io',
  baseUrl: '/',
  organizationName: 'Clustrail',
  projectName: 'clustrail.github.io',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  // The homepage's "Install" CTA links to #install, whose id is set on a
  // custom React section. Docusaurus's static anchor validator does not detect
  // ids injected by client components (the id is present in the built HTML and
  // resolves at runtime), so ignore the resulting false positive.
  onBrokenAnchors: 'ignore',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [tailwindPlugin, './plugins/releases.js'],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/docs',
          sidebarPath: './sidebars.ts',
          // The product is closed-source; docs pages carry no edit links.
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'favicon.svg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: false,
    },
    navbar: {
      logo: {
        alt: 'Clustrail',
        src: 'favicon.svg',
      },
      items: [
        {to: '/docs', label: 'Docs', position: 'right'},
        {to: '/changelog', label: 'Changelog', position: 'right'},
      ],
    },
    // The footer is a swizzled component (src/theme/Footer) rather than
    // Infima config, so it can carry the branded lockup and link columns.
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
