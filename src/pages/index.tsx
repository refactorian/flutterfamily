import type { ReactNode } from 'react';
import React, { lazy, Suspense } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Hero from '@site/src/components/Homepage/Hero';
import styles from '@site/src/components/Homepage/Homepage.module.css';

// Hero & above-fold content loaded eagerly.
// Sections below the fold are lazy-loaded to keep the initial bundle lean.
const EcosystemPillars = lazy(() => import('@site/src/components/Homepage/EcosystemPillars'));
const LibraryShowcase = lazy(() => import('@site/src/components/Homepage/LibraryShowcase'));
const LearningRoadmap = lazy(() => import('@site/src/components/Homepage/LearningRoadmap'));
const FeaturedArticles = lazy(() => import('@site/src/components/Homepage/FeaturedArticles'));
const CommunityBanner = lazy(() => import('@site/src/components/Homepage/CommunityBanner'));

function SectionFallback(): ReactNode {
  return <div style={{ minHeight: '200px' }} aria-hidden="true" />;
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title} — The Dart & Flutter Developer Hub`}
      description="Curated production-ready UI components, architectural blueprints, in-depth Dart guides, and state management patterns for Flutter developers."
    >
      {/* Hero is above the fold — always loaded eagerly */}
      <Hero />

      <main className={styles.pageContainer} style={{ marginTop: '4rem' }}>
        <Suspense fallback={<SectionFallback />}>
          <EcosystemPillars />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <LibraryShowcase />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <LearningRoadmap />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <FeaturedArticles />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <CommunityBanner />
        </Suspense>
      </main>
    </Layout>
  );
}
