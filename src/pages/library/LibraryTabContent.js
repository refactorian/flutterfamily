import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './library.module.css';

const DEFAULT_ITEMS_PER_PAGE = 8;

export default function LibraryTabContent({ items = [], tags = {} }) {
    const { siteConfig } = useDocusaurusContext();
    const itemsPerPage =
        (siteConfig.customFields?.libraryItemsPerPage) ?? DEFAULT_ITEMS_PER_PAGE;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const contentTopRef = useRef(null);

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

    // Reset pagination to first page when search, tags, or tab items change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedTags, items]);

    const totalItems = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const validPage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = (validPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
            if (contentTopRef.current) {
                contentTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    // Helper to generate page numbers
    const pageNumbers = useMemo(() => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }, [totalPages]);

    return (
        <div ref={contentTopRef}>
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
                <>
                    <div className={styles.cardGrid}>
                        {paginatedItems.map((item) => (
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
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className={styles.paginationContainer}>
                            <div className={styles.paginationInfo}>
                                Showing {startIndex + 1}–{endIndex} of {totalItems} items
                            </div>
                            <div className={styles.paginationControls}>
                                <button
                                    className={`${styles.pageButton} ${styles.navButton}`}
                                    onClick={() => handlePageChange(validPage - 1)}
                                    disabled={validPage === 1}
                                    aria-label="Previous Page"
                                >
                                    ← Prev
                                </button>

                                {pageNumbers.map((num) => (
                                    <button
                                        key={num}
                                        className={`${styles.pageButton} ${num === validPage ? styles.pageButtonActive : ''
                                            }`}
                                        onClick={() => handlePageChange(num)}
                                        aria-label={`Page ${num}`}
                                        aria-current={num === validPage ? 'page' : undefined}
                                    >
                                        {num}
                                    </button>
                                ))}

                                <button
                                    className={`${styles.pageButton} ${styles.navButton}`}
                                    onClick={() => handlePageChange(validPage + 1)}
                                    disabled={validPage === totalPages}
                                    aria-label="Next Page"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}