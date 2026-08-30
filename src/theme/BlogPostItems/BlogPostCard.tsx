import React from 'react';
import Link from '@docusaurus/Link';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import styles from './BlogPostItems.module.css';

export default function BlogPostCard(): React.ReactElement {
  const { metadata, assets } = useBlogPost();
  const {
    title,
    permalink,
    description,
    date,
    readingTime,
    tags = [],
    authors = [],
  } = metadata;

  // Format date cleanly (e.g. "Mar 15, 2026")
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : '';

  const roundedReadingTime =
    typeof readingTime !== 'undefined' ? `${Math.ceil(readingTime)} min read` : null;

  // Author details (first author or default team)
  const primaryAuthor = authors.length > 0 ? authors[0] : null;
  const authorImageUrl = assets?.authorsImageUrls?.[0] ?? primaryAuthor?.imageURL;
  const authorName = primaryAuthor?.name || 'Flutter Family';

  // Limit visible tags on the card to first 4
  const visibleTags = tags.slice(0, 4);
  const remainingTagsCount = tags.length - visibleTags.length;

  return (
    <article className={styles.postCard}>
      <div className={styles.cardLeftAccent} />

      {/* Top row: Tag badges & Date / Reading Time */}
      <div className={styles.cardTopRow}>
        <div className={styles.cardTags}>
          {visibleTags.map((tag) => (
            <Link
              key={tag.permalink}
              to={tag.permalink}
              className={styles.tagBadge}
              onClick={(e) => e.stopPropagation()}
            >
              {tag.label}
            </Link>
          ))}
          {remainingTagsCount > 0 && (
            <span className={styles.tagBadge}>+{remainingTagsCount}</span>
          )}
        </div>

        {(formattedDate || roundedReadingTime) && (
          <div className={styles.cardMeta}>
            {formattedDate && <span>{formattedDate}</span>}
            {formattedDate && roundedReadingTime && <span className={styles.metaDot}>•</span>}
            {roundedReadingTime && <span>{roundedReadingTime}</span>}
          </div>
        )}
      </div>

      {/* Post Title */}
      <h2 className={styles.cardTitle}>
        <Link to={permalink} className={styles.cardTitleLink}>
          {title}
        </Link>
      </h2>

      {/* Post Description / Excerpt */}
      {description && <p className={styles.cardDescription}>{description}</p>}

      {/* Card Footer: Simple, Clean Author Info & Read CTA */}
      <div className={styles.cardFooter}>
        <div className={styles.authorRow}>
          {authorImageUrl ? (
            <img
              src={authorImageUrl}
              alt={authorName}
              className={styles.authorAvatar}
              loading="lazy"
            />
          ) : (
            <div className={styles.authorAvatar}>
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className={styles.authorName}>{authorName}</span>
        </div>

        <Link to={permalink} className={styles.readMoreLink} aria-label={`Read article: ${title}`}>
          <span>Read Article</span>
          <span className={styles.arrowIcon}>→</span>
        </Link>
      </div>
    </article>
  );
}
