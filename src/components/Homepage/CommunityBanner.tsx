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
          Flutter Family is completely open source. Have a question, idea, or want to share what you've built?
          Join the conversation on GitHub Discussions — your feedback shapes what we build next.
        </p>

        <div className={styles.communityButtons}>
          <a
            href="https://github.com/refactorian/flutterfamily/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            <span>💬 Join GitHub Discussions</span>
          </a>
          <a
            href="https://github.com/refactorian/flutterfamily"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
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

        {/* Discussions highlight callout */}
        <div className={styles.discussionsCallout}>
          <span className={styles.discussionsIcon}>💬</span>
          <div>
            <strong>Active Community Discussions</strong>
            <p>Ask questions, request features, share your Flutter projects, and connect with other developers.</p>
          </div>
          <a
            href="https://github.com/refactorian/flutterfamily/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.discussionsLink}
          >
            Open Discussions →
          </a>
        </div>
      </div>
    </section>
  );
}
