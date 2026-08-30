import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './Homepage.module.css';

const METRICS = [
  { value: '20+', label: 'App Screens' },
  { value: '24+', label: 'UI Widgets' },
  { value: '6+', label: 'Full Templates' },
  { value: '35+', label: 'Guides & Docs' },
  { value: '100%', label: 'Open Source' },
];

export default function Hero(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={styles.heroWrapper}>
      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>
          <span>🚀</span>
          <span>The Complete Flutter & Dart Engineering Hub</span>
        </div>

        <h1 className={styles.heroTitle}>
          Build Beautiful, Performant <br />
          <span className={styles.gradientText}>Flutter Applications</span> Faster
        </h1>

        <p className={styles.heroDescription}>
          Curated production-ready UI components, scalable architecture blueprints, in-depth Dart guides, and state management tutorials — engineered for modern developers.
        </p>

        <div className={styles.heroButtons}>
          <Link
            to="/library"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            <span>Explore UI Library</span>
            <span>→</span>
          </Link>
          <Link
            to="/dart/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
          >
            <span>Dart Documentation</span>
          </Link>
          <Link
            to="/state-management/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
          >
            <span>State Management</span>
          </Link>
          <Link
            to="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
          >
            <span>Blog & Articles</span>
          </Link>
        </div>

        <div className={styles.heroMetrics}>
          {METRICS.map((metric, idx) => (
            <div key={idx} className={styles.metricCard}>
              <span className={styles.metricValue}>{metric.value}</span>
              <span className={styles.metricLabel}>{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
