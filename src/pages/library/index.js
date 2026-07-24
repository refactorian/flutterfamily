import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import LibraryTabContent from './LibraryTabContent';
import styles from './library.module.css';

const TABS = [
    { id: 'screens', label: '1. App Screens' },
    { id: 'templates', label: '2. Templates' },
    { id: 'widgets', label: '3. Widgets' },
];

export default function LibraryPage() {
    // Default selected tab is 'screens'
    const [activeTab, setActiveTab] = useState('screens');
    const [tabData, setTabData] = useState({ items: [], tags: {} });
    const [loading, setLoading] = useState(true);

    // Lazy load category data whenever activeTab changes
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const loadCategoryData = async () => {
            let dataModule;
            if (activeTab === 'screens') {
                dataModule = await import('@site/src/data/library/screensData');
                if (isMounted) {
                    setTabData({
                        items: dataModule.SCREENS_DATA,
                        tags: dataModule.TAGS_SCREENS,
                    });
                }
            } else if (activeTab === 'templates') {
                dataModule = await import('@site/src/data/library/templatesData');
                if (isMounted) {
                    setTabData({
                        items: dataModule.TEMPLATES_DATA,
                        tags: dataModule.TAGS_TEMPLATES,
                    });
                }
            } else if (activeTab === 'widgets') {
                dataModule = await import('@site/src/data/library/widgetsData');
                if (isMounted) {
                    setTabData({
                        items: dataModule.WIDGETS_DATA,
                        tags: dataModule.TAGS_WIDGETS,
                    });
                }
            }
            if (isMounted) setLoading(false);
        };

        loadCategoryData();

        return () => {
            isMounted = false;
        };
    }, [activeTab]);

    return (
        <Layout
            title="Flutter Component Library"
            description="Explore curated Flutter App Screens, Templates, and Widgets."
        >
            <main className="container margin-vert--lg">
                {/* Header & Top Center Tab Bar */}
                <div className={styles.headerContainer}>
                    <h1>Flutter Resource Library</h1>
                    <p>Discover production-ready screens, full templates, and custom UI widgets.</p>

                    <div className={styles.tabWrapper}>
                        <div className={styles.tabContainer}>
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Content Display */}
                {loading ? (
                    <div className="text--center margin-vert--xl">
                        <p>Loading library items...</p>
                    </div>
                ) : (
                    <LibraryTabContent items={tabData.items} tags={tabData.tags} />
                )}
            </main>
        </Layout>
    );
}