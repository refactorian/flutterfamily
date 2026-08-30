import React from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';
import defaultData from '@site/src/data/blogTagsData.json';
import styles from './BlogTagsBar.module.css';

interface BlogTagItem {
  key: string;
  label: string;
  permalink: string;
  count: number;
  description?: string;
}

interface BlogTagsPluginData {
  totalPosts?: number;
  tags?: BlogTagItem[];
}

export default function BlogTagsBar(): React.ReactElement | null {
  const location = useLocation();
  const currentPath = location.pathname;

  let pluginData: BlogTagsPluginData | undefined;
  try {
    pluginData = usePluginData('blog-tags-plugin') as BlogTagsPluginData;
  } catch {
    pluginData = undefined;
  }

  const tags: BlogTagItem[] = pluginData?.tags || defaultData.tags || [];
  const totalPosts: number = pluginData?.totalPosts ?? defaultData.totalPosts ?? 0;

  if (tags.length === 0) {
    return null;
  }

  const isBlogHome =
    currentPath === '/blog' ||
    currentPath === '/blog/' ||
    /^\/blog\/page\/\d+\/?$/.test(currentPath);

  return (
    <div className={styles.tagsWrapper}>
      <div className={styles.headerLine}>
        <div className={styles.titleGroup}>
          <span className={styles.titleIcon}>🏷️</span>
          <span>Blog Topics</span>
        </div>

        <Link to="/blog/tags" className={styles.viewAllLink} title="Explore all tags directory">
          <span>All Tags</span>
          <span>→</span>
        </Link>
      </div>

      <div className={styles.pillsList}>
        <Link
          to="/blog"
          className={`${styles.tagPill} ${isBlogHome ? styles.tagPillActive : ''}`}
        >
          <span>All Posts</span>
          {totalPosts > 0 && <span className={styles.countBadge}>{totalPosts}</span>}
        </Link>

        {tags.map((tag) => {
          const isTagActive =
            currentPath === tag.permalink ||
            currentPath === `${tag.permalink}/` ||
            currentPath.startsWith(`${tag.permalink}/page/`);

          return (
            <Link
              key={tag.key}
              to={tag.permalink}
              className={`${styles.tagPill} ${isTagActive ? styles.tagPillActive : ''}`}
              title={tag.description || `${tag.label} (${tag.count} posts)`}
            >
              <span>{tag.label}</span>
              <span className={styles.countBadge}>{tag.count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
