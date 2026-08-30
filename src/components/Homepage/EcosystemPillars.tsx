import React from 'react';
import Link from '@docusaurus/Link';
import styles from './Homepage.module.css';

const PILLARS = [
  {
    icon: '🎯',
    title: 'Dart Language Hub',
    description: 'Master modern Dart syntax, type systems, functional programming, and concurrency.',
    links: [
      { label: 'Records & Pattern Matching', url: '/dart/pattern-matching' },
      { label: 'Classes, Mixins & OOP', url: '/dart/classes-and-oop' },
      { label: 'Collections & Generators', url: '/dart/collections/' },
      { label: 'Futures & Async Await', url: '/dart/futures-and-async' },
      { label: 'Null Safety & Best Practices', url: '/dart/null-safety' },
      { label: 'Dart Cheat Sheet', url: '/dart/cheat-sheet' },
    ],
    ctaText: 'View All Dart Docs',
    ctaUrl: '/dart/',
  },
  {
    icon: '⚡',
    title: 'State Management',
    description: 'Architect scalable applications with industry-standard state patterns and dependency injection.',
    links: [
      { label: 'BLoC & Cubit Architecture', url: '/state-management/bloc/' },
      { label: 'Riverpod & Consumer Widgets', url: '/state-management/riverpod/' },
      { label: 'Provider & ChangeNotifier', url: '/state-management/provider/' },
      { label: 'GetX Reactive State', url: '/state-management/getx/' },
      { label: 'InheritedWidget Fundamentals', url: '/state-management/inherited-widget-basics' },
      { label: 'Concepts & Clean Architecture', url: '/state-management/concepts-and-architecture' },
    ],
    ctaText: 'Explore State Patterns',
    ctaUrl: '/state-management/',
  },
  {
    icon: '📱',
    title: 'UI Component Library',
    description: 'Drop-in Flutter UI screens, responsive widgets, and end-to-end template applications.',
    links: [
      { label: '20+ Production App Screens', url: '/library' },
      { label: '24+ Interactive Custom Widgets', url: '/library' },
      { label: '6+ Complete App Templates', url: '/library' },
      { label: 'Authentication & Onboarding', url: '/library/screens/login-screen' },
      { label: 'Dashboards & Analytics', url: '/library/screens/analytics-dashboard-screen' },
      { label: 'Checkout & Shopping Cart', url: '/library/screens/cart-screen' },
    ],
    ctaText: 'Browse Component Library',
    ctaUrl: '/library',
  },
  {
    icon: '🔥',
    title: 'Engineering Deep Dives',
    description: 'Advanced tutorials on graphics, rendering pipelines, profiling, and runtime performance.',
    links: [
      { label: 'Custom Painters & Canvas API', url: '/blog/mastering-custom-painters-and-canvas-in-flutter' },
      { label: 'Eliminating Jank & Profiling', url: '/blog/eliminating-jank-profiling-and-optimizing-flutter-rendering-performance' },
      { label: 'HydratedBloc State Persistence', url: '/blog/hydratedbloc-persistent-event-driven-state-flutter' },
      { label: 'Byte Manipulation & TypedData', url: '/blog/dart-binary-data-typed-data-bytebuffer-endianness' },
      { label: 'Deep Comparison & Equality', url: '/blog/dart-deep-comparison-and-value-equality' },
      { label: 'Flutter Directory Structures', url: '/blog/flutter-project-directory-structures' },
    ],
    ctaText: 'Read All Deep Dives',
    ctaUrl: '/blog',
  },
];

export default function EcosystemPillars(): React.ReactElement {
  return (
    <section className="container">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionBadge}>Knowledge Ecosystem</div>
        <h2 className={styles.sectionTitle}>Everything You Need to Master Flutter</h2>
        <p className={styles.sectionSubtitle}>
          Dive into structured guides, reusable UI resources, and architectural best practices crafted for Flutter engineers.
        </p>
      </div>

      <div className={styles.pillarsGrid}>
        {PILLARS.map((pillar, idx) => (
          <div key={idx} className={styles.pillarCard}>
            <div className={styles.pillarIconWrapper}>{pillar.icon}</div>
            <h3 className={styles.pillarTitle}>{pillar.title}</h3>
            <p className={styles.pillarDescription}>{pillar.description}</p>

            <ul className={styles.pillarLinksList}>
              {pillar.links.map((link, linkIdx) => (
                <li key={linkIdx}>
                  <Link
                    to={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.pillarLink}
                  >
                    <span>{link.label}</span>
                    <span>→</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.pillarAction}>
              <Link
                to={pillar.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.pillarActionLink}
              >
                <span>{pillar.ctaText}</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
