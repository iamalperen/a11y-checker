'use client';

import { useContext } from 'react';
import {
  faSun,
  faMoon,
  faUniversalAccess,
  faHome,
  faInfoCircle,
  faTools,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../../context/ThemeContext';
import styles from './Header.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

export default function Header() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className={styles.header}>
      <div className={`${styles.headerContainer} container`}>
        <Link href="/" className={styles.logo}>
          <FontAwesomeIcon
            icon={faUniversalAccess}
            className={styles.logoIcon}
          />
          <span className={styles.logoText}>A11Y Checker</span>
        </Link>

        <nav className={styles.navbar}>
          <ul className={styles.navMenu}>
            <li className={styles.navItem}>
              <Link href="/" className={styles.navLink}>
                <FontAwesomeIcon icon={faHome} className={styles.navIcon} />
                <span>Home</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/tools" className={styles.navLink}>
                <FontAwesomeIcon icon={faTools} className={styles.navIcon} />
                <span>Tools</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/about" className={styles.navLink}>
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className={styles.navIcon}
                />
                <span>About</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/faq" className={styles.navLink}>
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  className={styles.navIcon}
                />
                <span>FAQ</span>
              </Link>
            </li>
          </ul>
        </nav>

        <button
          onClick={toggleTheme}
          className={styles.themeSwitcher}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <FontAwesomeIcon icon={theme === 'light' ? faSun : faMoon} />
        </button>
      </div>
    </header>
  );
}
