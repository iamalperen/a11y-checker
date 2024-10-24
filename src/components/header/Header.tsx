'use client';

import { useContext } from 'react';
import {
  faSun,
  faMoon,
  faUniversalAccess,
} from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../../context/ThemeContext';
import styles from './Header.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Header() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className={styles.header}>
      <div className={`${styles.headerContainer} container`}>
        <div className={styles.logo}>
          <FontAwesomeIcon icon={faUniversalAccess} />
          A11Y Checker
        </div>
        <button onClick={toggleTheme} className={styles.themeSwitcher}>
          <FontAwesomeIcon icon={theme === 'light' ? faSun : faMoon} />
        </button>
      </div>
    </header>
  );
}
