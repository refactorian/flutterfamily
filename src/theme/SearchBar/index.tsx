import React from 'react';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

export default function SearchBar() {
  const history = useHistory();
  const { siteConfig: { baseUrl } } = useDocusaurusContext();

  const handleClick = () => {
    history.push(`${baseUrl}search/`);
  };

  return (
    <button
      className={styles.searchIconBtn}
      onClick={handleClick}
      aria-label="Search"
      title="Search"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 16 16"
        className={styles.searchIcon}
      >
        <path
          fill="currentColor"
          d="M6.02945 10.20327a4.17382 4.17382 0 1 1 4.17382-4.17382 4.15609 4.15609 0 0 1-4.17382 4.17382Zm9.69195 4.2199-4.8225-4.82338A5.88021 5.88021 0 0 0 12.058 6.02856 6.00467 6.00467 0 1 0 9.59979 10.8989l4.82338 4.82338a.89729.89729 0 0 0 1.29912 0 .89749.89749 0 0 0-.00087-1.29909Z"
        />
      </svg>
    </button>
  );
}
