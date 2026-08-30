import React from 'react';
import Link from '@docusaurus/Link';
import styles from './Homepage.module.css';

const ROADMAP_TRACKS = [
  {
    step: 'Track 01',
    title: 'Dart Language Mastery',
    description: 'From core fundamentals to cutting-edge Dart 3 language capabilities.',
    items: [
      'Variables, Types & Null Safety',
      'Object-Oriented Programming & Mixins',
      'Records, Patterns & Switch Expressions',
      'Advanced Collections & Custom Iterators',
      'Async Programming, Futures & Streams',
    ],
    ctaText: 'Start Learning Dart',
    ctaUrl: '/dart/introduction',
  },
  {
    step: 'Track 02',
    title: 'State Architecture',
    description: 'Learn how to choose, structure, and scale state solutions.',
    items: [
      'Ephemeral State vs App-Wide State',
      'Provider & ChangeNotifier Patterns',
      'Riverpod: Scopes, Providers & State',
      'BLoC & Cubit Reactive Event Architecture',
      'State Persistence & Hydration Techniques',
    ],
    ctaText: 'Master State Management',
    ctaUrl: '/state-management/concepts-and-architecture',
  },
  {
    step: 'Track 03',
    title: 'UI Design Systems & Performance',
    description: 'Build fast, responsive 60/120fps Flutter interfaces.',
    items: [
      'Modular Directory & Clean Layered Design',
      'CustomPainters, Shaders & Canvas Graphics',
      'Eliminating Jank & Profiling with DevTools',
      'Memory Management & GPU Optimization',
      'Deploying Production Screen Templates',
    ],
    ctaText: 'Explore Deep Dives',
    ctaUrl: '/blog',
  },
];

export default function LearningRoadmap(): React.ReactElement {
  return (
    <section className="container">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionBadge}>Curated Learning Paths</div>
        <h2 className={styles.sectionTitle}>Structured Engineering Roadmaps</h2>
        <p className={styles.sectionSubtitle}>
          Follow step-by-step tracks designed to take you from foundational concepts to advanced production architecture.
        </p>
      </div>

      <div className={styles.roadmapGrid}>
        {ROADMAP_TRACKS.map((track, idx) => (
          <div key={idx} className={styles.roadmapCard}>
            <div className={styles.roadmapStepBadge}>{track.step}</div>
            <h3 className={styles.roadmapTitle}>{track.title}</h3>
            <p className={styles.roadmapDesc}>{track.description}</p>

            <ul className={styles.roadmapItems}>
              {track.items.map((item, itemIdx) => (
                <li key={itemIdx} className={styles.roadmapItem}>
                  <span className={styles.checkIcon}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              to={track.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnSecondary}
            >
              <span>{track.ctaText}</span>
              <span>→</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
