import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';
import type { Props } from '@theme/BlogLayout';
import BlogTagsBar from '@site/src/components/BlogTagsBar';
import RelatedBlogPosts from '@site/src/components/RelatedBlogPosts';

export default function BlogLayout(props: Props): ReactNode {
  const { sidebar, toc, children, ...layoutProps } = props;
  const hasSidebar = sidebar && sidebar.items.length > 0;

  return (
    <Layout {...layoutProps}>
      <div className="container margin-vert--lg">
        {/* Full-width tags bar right below <nav>, above the sidebar and content row */}
        <BlogTagsBar />

        <div className="row">
          <BlogSidebar sidebar={sidebar} />
          <main
            className={clsx('col', {
              'col--7': hasSidebar,
              'col--9 col--offset-1': !hasSidebar,
            })}>
            {children}
          </main>
          {toc && <div className="col col--2">{toc}</div>}
        </div>

        {/* Full-width Independent Related Blog Posts Section placed below the main row */}
        <RelatedBlogPosts />
      </div>
    </Layout>
  );
}
