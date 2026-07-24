import React, { useState, useMemo } from 'react';
import Link from '@docusaurus/Link';
import styles from './library.module.css';

export default function LibraryTabContent({ items = [], tags = {} }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    const toggleTag = (tagKey) => {
        setSelectedTags((prev) =>
            prev.includes(tagKey) ? prev.filter((t) => t !== tagKey) : [...prev, tagKey]
        );
    };

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesTags =
                selectedTags.length === 0 ||
                selectedTags.every((tag) => item.tags.includes(tag));

            return matchesSearch && matchesTags;
        });
    }, [items, searchQuery, selectedTags]);

    return (
        <div>
            {/* Search Bar & Filters */}
            <div className={styles.filterSection}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by keyword or component title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {Object.keys(tags).length > 0 && (
                    <div className={styles.tagGroup}>
                        {Object.entries(tags).map(([key, tag]) => {
                            const isActive = selectedTags.includes(key);
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleTag(key)}
                                    className={`${styles.tagButton} ${isActive ? styles.tagButtonActive : ''}`}
                                >
                                    {tag.label}
                                </button>
                            );
                        })}
                        {selectedTags.length > 0 && (
                            <button
                                onClick={() => setSelectedTags([])}
                                className="button button--link button--sm"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Cards Grid */}
            {filteredItems.length === 0 ? (
                <div className="text--center margin-vert--xl">
                    <h3>No items matched your search criteria.</h3>
                    <p>Try resetting filters or changing your search terms.</p>
                </div>
            ) : (
                <div className={styles.cardGrid}>
                    {filteredItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.cardLinkWrapper}
                        >
                            <div className={styles.itemCard}>
                                <img src={item.image} alt={item.title} className={styles.cardImage} />
                                <div className={styles.cardBody}>
                                    <h3 className={styles.cardTitle}>{item.title}</h3>
                                    <p className={styles.cardDescription}>{item.description}</p>
                                    <div>
                                        {item.tags.map((t) => (
                                            <span
                                                key={t}
                                                className="badge margin-right--xs margin-bottom--xs"
                                                style={{
                                                    backgroundColor: tags[t]?.color || 'var(--ifm-color-primary)',
                                                    color: '#fff',
                                                }}
                                            >
                                                {tags[t]?.label || t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.cardFooter}>
                                    {/* Visual Button inside the full clickable card */}
                                    <span className={styles.detailsButton}>
                                        View Documentation & Code &rarr;
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}