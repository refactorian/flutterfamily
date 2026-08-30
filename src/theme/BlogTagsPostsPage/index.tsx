import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import { useBlogTagsPostsPageTitle } from '@docusaurus/theme-common/internal';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import type { Props } from '@theme/BlogTagsPostsPage';
import BlogPostItems from '@theme/BlogPostItems';
import Unlisted from '@theme/ContentVisibility/Unlisted';
import styles from '../BlogPostItems/BlogPostItems.module.css';

function BlogTagsPostsPageMetadata({ tag }: Props): ReactNode {
  const title = useBlogTagsPostsPageTitle(tag);
  return (
    <>
      <PageMetadata title={title} description={tag.description} />
      <SearchMetadata tag="blog_tags_posts" />
    </>
  );
}

function BlogTagsPostsPageContent({
  tag,
  items,
  sidebar,
  listMetadata,
}: Props): ReactNode {
  const postCount = tag.count ?? items.length;
  const countText = `${postCount} ${postCount === 1 ? 'Article' : 'Articles'}`;

  return (
    <BlogLayout sidebar={sidebar}>
      {tag.unlisted && <Unlisted />}

      {/* Modern Compact Tag Page Header */}
      <header className={styles.tagHeaderBanner}>
        <div className={styles.tagHeaderTop}>
          <h1 className={styles.tagTitle}>
            <span>{tag.label}</span>
            <span className={styles.tagCountBadge}>{countText}</span>
          </h1>

          <Link to="/blog" className={styles.backToBlogLink}>
            <span>←</span>
            <span>All Articles</span>
          </Link>
        </div>

        {tag.description && <p className={styles.tagDescription}>{tag.description}</p>}
      </header>

      {/* Modern Post Cards List */}
      <BlogPostItems items={items} />

      {/* Pagination */}
      <BlogListPaginator metadata={listMetadata} />
    </BlogLayout>
  );
}

export default function BlogTagsPostsPage(props: Props): ReactNode {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagPostListPage,
      )}>
      <BlogTagsPostsPageMetadata {...props} />
      <BlogTagsPostsPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
