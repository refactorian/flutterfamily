import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './RelatedLibraryItems.module.css';

const CATEGORY_LOADERS = {
    screens: () =>
        import('@site/src/data/library/screensData').then((m) => ({
            items: m.SCREENS_DATA,
            tags: m.TAGS_SCREENS,
        })),
    templates: () =>
        import('@site/src/data/library/templatesData').then((m) => ({
            items: m.TEMPLATES_DATA,
            tags: m.TAGS_TEMPLATES,
        })),
    widgets: () =>
        import('@site/src/data/library/widgetsData').then((m) => ({
            items: m.WIDGETS_DATA,
            tags: m.TAGS_WIDGETS,
        })),
};

type Category = keyof typeof CATEGORY_LOADERS;

interface LibraryItem {
    id: string;
    title: string;
    description: string;
    tags: string[];
    image: string;
    docUrl: string;
}

interface TagDef {
    label: string;
    color: string;
}

const DEFAULT_ITEMS_COUNT = 8;

function detectCategory(pathname: string): Category | null {
    for (const cat of Object.keys(CATEGORY_LOADERS) as Category[]) {
        if (pathname.includes(`/library/${cat}`)) {
            return cat;
        }
    }
    return null;
}

function detectCurrentId(pathname: string): string {
    // e.g. /library/screens/login-screen → login-screen
    return pathname.split('/').filter(Boolean).pop() ?? '';
}

const CATEGORY_LABELS: Record<Category, string> = {
    screens: 'App Screens',
    templates: 'Templates',
    widgets: 'Widgets',
};

export default function RelatedLibraryItems(): React.ReactElement | null {
    const location = useLocation();
    const { siteConfig } = useDocusaurusContext();
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [tags, setTags] = useState<Record<string, TagDef>>({});
    const [loaded, setLoaded] = useState(false);

    const category = detectCategory(location.pathname);
    const currentId = detectCurrentId(location.pathname);

    // Read configured count from docusaurus.config.ts (customFields.libraryRelatedItemsCount)
    const maxItems =
        (siteConfig.customFields?.libraryRelatedItemsCount as number) ??
        DEFAULT_ITEMS_COUNT;

    useEffect(() => {
        if (!category) return;
        let alive = true;

        // Use a short setTimeout so the main content renders first
        const timer = setTimeout(() => {
            CATEGORY_LOADERS[category]().then(({ items: all, tags: t }) => {
                if (!alive) return;
                // exclude the current page, cap at configured maxItems
                const related = all
                    .filter((item) => item.id !== currentId)
                    .slice(0, maxItems);
                setItems(related);
                setTags(t);
                setLoaded(true);
            });
        }, 100);

        return () => {
            alive = false;
            clearTimeout(timer);
        };
    }, [category, currentId, maxItems]);

    if (!category || !loaded || items.length === 0) return null;

    return (
        <section className={styles.relatedSection}>
            <div className={styles.relatedHeader}>
                <h2 className={styles.relatedTitle}>
                    More {CATEGORY_LABELS[category]}
                </h2>
                <a
                    href={`/library`}
                    className={styles.viewAllLink}
                >
                    View All →
                </a>
            </div>
            <div className={styles.relatedGrid}>
                {items.map((item) => (
                    <a
                        key={item.id}
                        href={item.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.relatedCard}
                    >
                        <div className={styles.imageWrapper}>
                            <img
                                src={item.image}
                                alt={item.title}
                                className={styles.relatedImage}
                                loading="lazy"
                            />
                        </div>
                        <div className={styles.relatedCardBody}>
                            <h4 className={styles.relatedCardTitle}>{item.title}</h4>
                            <div className={styles.tagRow}>
                                {item.tags.slice(0, 2).map((t) => (
                                    <span
                                        key={t}
                                        className={styles.tag}
                                        style={{
                                            backgroundColor:
                                                tags[t]?.color || 'var(--ifm-color-primary)',
                                        }}
                                    >
                                        {tags[t]?.label || t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
