import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';
import type { Props } from '@theme/BlogPostItem';
import BlogPostCard from '@site/src/theme/BlogPostItems/BlogPostCard';

export default function BlogPostItem({ children, className }: Props): ReactNode {
  const { isBlogPostPage } = useBlogPost();

  if (!isBlogPostPage) {
    return <BlogPostCard />;
  }

  return (
    <BlogPostItemContainer className={clsx(className)}>
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
    </BlogPostItemContainer>
  );
}
