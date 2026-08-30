import React from 'react';
import Link from '@docusaurus/Link';
import blogPostsData from '@site/src/data/blogPostsData.json';
import styles from './Homepage.module.css';

interface BlogPostItem {
  title: string;
  permalink: string;
  date?: string;
  tags?: string[];
}

export default function FeaturedArticles(): React.ReactElement {
  const recentPosts: BlogPostItem[] = (blogPostsData as BlogPostItem[]).slice(0, 9);

  return (
    <section className="container">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionBadge}>Latest Insights</div>
        <h2 className={styles.sectionTitle}>Recent Engineering Articles</h2>
        <p className={styles.sectionSubtitle}>
          Stay up to date with deep technical breakdowns, performance profiling walkthroughs, and architectural blueprints.
        </p>
      </div>

      <div className={styles.articlesGrid}>
        {recentPosts.map((article, idx) => (
          <Link
            key={idx}
            to={article.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.articleCard}
          >
            <div className={styles.articleTagsRow}>
              {(article.tags || []).slice(0, 3).map((tag, tagIdx) => (
                <span key={tagIdx} className={styles.articleTag}>
                  {tag}
                </span>
              ))}
            </div>

            <h4 className={styles.articleTitle}>{article.title}</h4>

            <div className={styles.articleFooter}>
              {article.date && (
                <span style={{ fontSize: '0.8rem', color: 'var(--ifm-color-content-secondary)' }}>
                  {article.date}
                </span>
              )}
              <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>Read</span>
                <span>→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.centerCTA} style={{ marginTop: '2.5rem' }}>
        <Link
          to="/blog"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btnSecondary}
        >
          <span>View All Articles & Topics ({(blogPostsData as BlogPostItem[]).length}+)</span>
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}
