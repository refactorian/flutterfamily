import React, { type ReactNode } from 'react';
import { BlogPostProvider } from '@docusaurus/plugin-content-blog/client';
import type { Props } from '@theme/BlogPostItems';
import BlogPostCard from './BlogPostCard';
import styles from './BlogPostItems.module.css';

export default function BlogPostItems({ items }: Props): ReactNode {
  return (
    <div className={styles.postsList}>
      {items.map(({ content: BlogPostContent }) => (
        <BlogPostProvider
          key={BlogPostContent.metadata.permalink}
          content={BlogPostContent}
        >
          <BlogPostCard />
        </BlogPostProvider>
      ))}
    </div>
  );
}
