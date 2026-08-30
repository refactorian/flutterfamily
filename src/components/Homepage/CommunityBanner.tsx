import React from 'react';
import Link from '@docusaurus/Link';
import styles from './Homepage.module.css';

export default function CommunityBanner(): React.ReactElement {
  return (
    <section className="container">
      <div className={styles.communityCard}>
        <div className={styles.sectionBadge}>Open Source & Community</div>
        <h2 className={styles.communityTitle}>Built for the Community, by Developers</h2>
        <p className={styles.communityDesc}>
          Flutter Family is completely open source. Contribute code snippets, suggest new UI widgets, submit bug fixes, or request topics.
        </p>

        <div className={styles.communityButtons}>
          <a
            href="https://github.com/refactorian/flutterfamily"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            <span>⭐ Star on GitHub</span>
          </a>
          <Link
            to="/library"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
          >
            <span>Explore Library</span>
          </Link>
          <Link
            to="/dart/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
          >
            <span>Browse Docs</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
