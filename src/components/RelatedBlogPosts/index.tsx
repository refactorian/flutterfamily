import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import styles from './RelatedBlogPosts.module.css';

interface BlogPostData {
  title: string;
  permalink: string;
  date?: string;
  tags?: string[];
}

const DEFAULT_RELATED_POSTS_COUNT = 10;

function useSafeBlogPost() {
  try {
    return useBlogPost();
  } catch {
    return null;
  }
}

export default function RelatedBlogPosts(): React.ReactElement | null {
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();
  const blogContext = useSafeBlogPost();

  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Check if current page is an individual blog post
  const isSinglePost =
    blogContext?.isBlogPostPage ||
    (location.pathname.startsWith('/blog/') &&
      !location.pathname.startsWith('/blog/tags') &&
      !location.pathname.startsWith('/blog/page') &&
      !location.pathname.startsWith('/blog/archive') &&
      location.pathname !== '/blog' &&
      location.pathname !== '/blog/');

  const currentPermalink = blogContext?.metadata?.permalink || location.pathname;
  const currentTags = (blogContext?.metadata?.tags || []).map((t) =>
    typeof t === 'string' ? t : (t.label || t.permalink || '').toLowerCase()
  );

  const maxItems =
    (siteConfig.customFields?.blogRelatedPostsCount as number) ??
    DEFAULT_RELATED_POSTS_COUNT;

  useEffect(() => {
    if (!isSinglePost) return;

    let isMounted = true;

    // Load data lazily after main content renders to ensure zero impact on initial page load
    const timer = setTimeout(() => {
      import('@site/src/data/blogPostsData.json')
        .then((module) => {
          if (!isMounted) return;
          const allPosts: BlogPostData[] = module.default || module || [];

          // Exclude current post
          const otherPosts = allPosts.filter(
            (p) =>
              p.permalink !== currentPermalink &&
              p.permalink.replace(/\/$/, '') !== currentPermalink.replace(/\/$/, '')
          );

          // Score posts based on matching tags
          const scoredPosts = otherPosts.map((post) => {
            const postTags = (post.tags || []).map((t) => t.toLowerCase());
            let matchCount = 0;
            for (const t of postTags) {
              if (currentTags.includes(t)) {
                matchCount++;
              }
            }
            return { post, matchCount };
          });

          // Sort by highest matching tags first, preserving order for ties
          scoredPosts.sort((a, b) => b.matchCount - a.matchCount);

          const finalPosts = scoredPosts
            .map((item) => item.post)
            .slice(0, maxItems);

          setRelatedPosts(finalPosts);
          setLoaded(true);
        })
        .catch((err) => {
          console.error('Error loading related blog posts:', err);
        });
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isSinglePost, currentPermalink, maxItems]);

  if (!isSinglePost || !loaded || relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className={styles.relatedContainer} aria-label="Related Blog Posts">
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <span className={styles.titleIcon}>📚</span>
          <span>Related Articles</span>
        </div>
        <Link to="/blog" className={styles.exploreLink}>
          <span>All Posts</span>
          <span>→</span>
        </Link>
      </div>

      <div className={styles.postsGrid}>
        {relatedPosts.map((post) => (
          <Link
            key={post.permalink}
            to={post.permalink}
            className={styles.postCard}
            title={post.title}
          >
            <span className={styles.postTitle}>{post.title}</span>
            <span className={styles.postArrow}>→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
