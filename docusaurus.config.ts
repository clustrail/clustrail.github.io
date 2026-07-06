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

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [tailwindPlugin],

  presets: [
    [
      'classic',
      {
        // Landing page only for now; docs and blog come later.
        docs: false,
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
      items: [],
    },
    footer: {
      copyright: '© 2026 Clustrail',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
