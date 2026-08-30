import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { SCREENS_DATA } from '@site/src/data/library/screensData';
import { TEMPLATES_DATA } from '@site/src/data/library/templatesData';
import { WIDGETS_DATA } from '@site/src/data/library/widgetsData';
import styles from './Homepage.module.css';

type TabType = 'screens' | 'templates' | 'widgets';

export default function LibraryShowcase(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('screens');

  const getItems = () => {
    if (activeTab === 'screens') return SCREENS_DATA.slice(0, 8);
    if (activeTab === 'templates') return TEMPLATES_DATA.slice(0, 6);
    return WIDGETS_DATA.slice(0, 8);
  };

  const items = getItems();

  return (
    <section className="container">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionBadge}>Production UI Library</div>
        <h2 className={styles.sectionTitle}>Ready-to-Use Screens & Components</h2>
        <p className={styles.sectionSubtitle}>
          Save hundreds of development hours. Copy clean, modular Flutter code directly into your application.
        </p>
      </div>

      <div className={styles.libraryTabSelector}>
        <button
          className={`${styles.libraryTabBtn} ${activeTab === 'screens' ? styles.libraryTabBtnActive : ''}`}
          onClick={() => setActiveTab('screens')}
        >
          <span>📱 App Screens ({SCREENS_DATA.length})</span>
        </button>
        <button
          className={`${styles.libraryTabBtn} ${activeTab === 'templates' ? styles.libraryTabBtnActive : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <span>🚀 Full Templates ({TEMPLATES_DATA.length})</span>
        </button>
        <button
          className={`${styles.libraryTabBtn} ${activeTab === 'widgets' ? styles.libraryTabBtnActive : ''}`}
          onClick={() => setActiveTab('widgets')}
        >
          <span>✨ Custom Widgets ({WIDGETS_DATA.length})</span>
        </button>
      </div>

      <div className={styles.libraryShowcaseGrid}>
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.showcaseCard}
          >
            <div className={styles.showcaseImageWrapper}>
              <img
                src={item.image}
                alt={item.title}
                className={styles.showcaseImage}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className={styles.showcaseBody}>
              <h4 className={styles.showcaseTitle}>{item.title}</h4>
              <p className={styles.showcaseDesc}>{item.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.centerCTA}>
        <Link
          to="/library"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btnPrimary}
        >
          <span>Browse Full Library ({SCREENS_DATA.length + TEMPLATES_DATA.length + WIDGETS_DATA.length}+ Items)</span>
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}
