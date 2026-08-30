import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Flutter Family',
  tagline: 'A community for Flutter developers',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  markdown: {
    mermaid: true,
  },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import('@easyops-cn/docusaurus-search-local').PluginOptions} */
      {
        // ── Indexing scope ──────────────────────────────────────────────────
        indexDocs: true,
        indexBlog: true,
        indexPages: false, // pages (home, etc.) add noise; keep search focused

        // ── Route paths — MUST match routeBasePath in your plugin configs ──
        docsRouteBasePath: ['dart', 'state-management', 'library'],
        blogRouteBasePath: '/blog',

        // ── Source dirs — used to compute the content hash ─────────────────
        docsDir: ['dart', 'state-management', 'library'],
        blogDir: 'blog',

        // ── Cache busting: hash baked into filename (CDN-friendly) ─────────
        hashed: 'filename',

        // ── Multi-instance: which docs plugin drives version preference ────
        docsPluginIdForPreferredVersion: 'default',

        // ── Language ────────────────────────────────────────────────────────
        language: ['en'],

        // ── UX: highlight matched terms on the destination page ────────────
        highlightSearchTermsOnTargetPage: true,

        // ── UX: show breadcrumb path in results (e.g. Dart › Variables) ───
        explicitSearchResultPath: true,

        // ── UX: more context chars around each match (default: 50) ─────────
        searchResultContextMaxLength: 100,

        // ── UX: show up to 10 results (default: 8) ─────────────────────────
        searchResultLimits: 10,

        // ── Keyboard shortcut: industry-standard ⌘K / Ctrl+K ──────────────
        searchBarShortcut: true,
        searchBarShortcutHint: true,
        searchBarShortcutKeymap: 'mod+k',

        // ── Programming docs: keep stop words like "as", "is", "in" ────────
        removeDefaultStopWordFilter: true,

        // ── Ignore nav/sidebar/footer chrome — only index page content ─────
        ignoreCssSelectors: [
          '.navbar',
          '.footer',
          '.pagination-nav',
          '.theme-doc-breadcrumbs',
          '.theme-doc-toc-desktop',
          '.theme-doc-toc-mobile',
        ],
      },
    ],
  ],

  // Custom fields accessible via useDocusaurusContext()
  customFields: {
    libraryRelatedItemsCount: 12,
    libraryItemsPerPage: 12,
    blogRelatedPostsCount: 20,
  },

  // Set the production url of your site here
  url: 'https://flutterfamily.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'refactorian', // Usually your GitHub org/user name.
  projectName: 'flutterfamily', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: './dart',
          sidebarPath: './sidebars.ts',
          routeBasePath: 'dart',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/refactorian/flutterfamily/edit/main/',
        },
        blog: {
          showReadingTime: true,
          postsPerPage: 15,
          blogSidebarCount: 0,
          feedOptions: {
            type: ['rss'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tests/**'],
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'state-management',
        path: 'state-management',
        routeBasePath: 'state-management',
        sidebarPath: './sidebarsStateManagement.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'library',
        path: 'library',
        routeBasePath: 'library',
        sidebarPath: false,
      },
    ],
    './src/plugins/blog-tags-plugin.js',
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/flutter-family-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Flutter Family',
      logo: {
        alt: 'Flutter Family Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/blog',
          label: 'Blog',
          position: 'left',
        },
        {
          to: '/library',
          label: 'Library',
          position: 'left',
          activeBaseRegex: '^/library',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Dart',
        },
        {
          type: 'docSidebar',
          sidebarId: 'stateManagementSidebar',
          docsPluginId: 'state-management',
          position: 'left',
          label: 'State Management',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Dart Tutorial',
              to: '/dart/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/refactorian/flutterfamily/discussions',
            },
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/flutter',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/refactorian/flutterfamily',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Flutter Family. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['dart', 'bash', 'json', 'diff'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
