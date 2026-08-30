import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const FOOTER_LINKS = [
  {
    heading: 'Dart Language',
    links: [
      { label: 'Introduction', to: '/dart/introduction' },
      { label: 'Variables & Types', to: '/dart/variables-and-types' },
      { label: 'Classes & OOP', to: '/dart/classes-and-oop' },
      { label: 'Collections', to: '/dart/collections/' },
      { label: 'Futures & Async', to: '/dart/futures-and-async' },
      { label: 'Dart Cheat Sheet', to: '/dart/cheat-sheet' },
    ],
  },
  {
    heading: 'State Management',
    links: [
      { label: 'Architecture Concepts', to: '/state-management/concepts-and-architecture' },
      { label: 'BLoC & Cubit', to: '/state-management/bloc/' },
      { label: 'Riverpod', to: '/state-management/riverpod/' },
      { label: 'Provider', to: '/state-management/provider/' },
      { label: 'GetX', to: '/state-management/getx/' },
      { label: 'InheritedWidget', to: '/state-management/inherited-widget-basics' },
    ],
  },
  {
    heading: 'UI Library',
    links: [
      { label: 'All Screens', to: '/library' },
      { label: 'App Templates', to: '/library' },
      { label: 'Custom Widgets', to: '/library' },
      { label: 'Login Screen', to: '/library/screens/login-screen' },
      { label: 'Analytics Dashboard', to: '/library/screens/analytics-dashboard-screen' },
      { label: 'Cart Screen', to: '/library/screens/cart-screen' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog & Articles', to: '/blog' },
      { label: 'GitHub Repository', href: 'https://github.com/refactorian/flutterfamily' },
      { label: 'GitHub Discussions', href: 'https://github.com/refactorian/flutterfamily/discussions' },
      { label: 'Flutter Docs', href: 'https://docs.flutter.dev' },
      { label: 'Dart Docs', href: 'https://dart.dev/guides' },
    ],
  },
];

export default function Footer(): React.ReactElement | null {
  return (
    <footer className={styles.footer}>
      {/* Top gradient border */}
      <div className={styles.topBar} />

      <div className={styles.inner}>
        {/* Brand column */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🦋</span>
            <span className={styles.logoText}>Flutter Family</span>
          </div>
          <p className={styles.tagline}>
            The complete Flutter & Dart engineering hub — production-ready UI components, architecture blueprints, and deep technical guides.
          </p>
          <div className={styles.socialRow}>
            <a
              href="https://github.com/refactorian/flutterfamily"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              aria-label="GitHub"
            >
              <svg height="18" viewBox="0 0 16 16" width="18" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span>GitHub</span>
            </a>
            <a
              href="https://github.com/refactorian/flutterfamily/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              aria-label="GitHub Discussions"
            >
              {/* Chat bubble icon */}
              <svg height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.52 3.66 1.42 5.18L2 22l4.82-1.42A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 01-4.07-1.12l-.29-.18-3 .88.88-3-.18-.29A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm4.29-5.71c-.23-.12-1.38-.68-1.59-.76-.21-.08-.37-.12-.52.12-.16.23-.6.76-.74.92-.14.16-.27.18-.5.06-.23-.12-.97-.36-1.85-1.14-.68-.61-1.14-1.36-1.28-1.59-.13-.23-.01-.35.1-.47.11-.11.23-.28.35-.42.12-.14.16-.23.23-.39.08-.16.04-.3-.02-.42-.06-.12-.52-1.26-.72-1.73-.19-.45-.38-.39-.52-.4H7.9c-.14 0-.38.05-.57.27-.2.21-.75.74-.75 1.8s.77 2.09.88 2.23c.11.14 1.52 2.32 3.68 3.25.51.22.91.35 1.22.45.51.16.98.14 1.35.08.41-.07 1.27-.52 1.44-1.02.18-.5.18-.93.13-1.02-.05-.09-.2-.14-.43-.26z"/>
              </svg>
              <span>Discussions</span>
            </a>
          </div>

          <div className={styles.openSourceBadge}>
            <span>⭐</span>
            <span>100% Open Source</span>
          </div>
        </div>

        {/* Link columns */}
        <div className={styles.linksGrid}>
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading} className={styles.linkCol}>
              <h4 className={styles.colHeading}>{col.heading}</h4>
              <ul className={styles.linkList}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.footerLink}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.to!} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <span>© {new Date().getFullYear()} Flutter Family. Built with ❤️ for the Flutter community.</span>
        <span className={styles.builtWith}>
          Powered by{' '}
          <a href="https://docusaurus.io" target="_blank" rel="noopener noreferrer">
            Docusaurus
          </a>
        </span>
      </div>
    </footer>
  );
}
