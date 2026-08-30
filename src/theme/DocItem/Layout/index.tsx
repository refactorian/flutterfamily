import React, { type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import Layout from '@theme-original/DocItem/Layout';
import type LayoutType from '@theme/DocItem/Layout';
import type { WrapperProps } from '@docusaurus/types';
import RelatedLibraryItems from '@site/src/components/RelatedLibraryItems';

type Props = WrapperProps<typeof LayoutType>;

/** Only inject related items on library single-item pages */
function isLibraryDocPage(pathname: string): boolean {
  return /^\/library\/(screens|templates|widgets)\//.test(pathname);
}

export default function LayoutWrapper(props: Props): ReactNode {
  const { pathname } = useLocation();

  return (
    <>
      <Layout {...props} />
      {isLibraryDocPage(pathname) && <RelatedLibraryItems />}
    </>
  );
}
