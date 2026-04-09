import React from 'react';
import styles from './Navbar.module.css';

export default function Navbar({ onGetStarted, onLogoClick, onNavigateSection }) {
  const handleNavigate = (sectionId) => {
    onNavigateSection?.(sectionId);
  };

  return (
    <nav className={styles.nav}>
      <button className={styles.logo} onClick={onLogoClick} type="button">
        <div className={styles.spiderIcon}>🕷️</div>
        CareerCrawler <span className={styles.version}>/ v1.0</span>
      </button>

      <ul className={styles.links}>
        <li><button type="button" onClick={() => handleNavigate('jobs')}>Jobs</button></li>
        <li><button type="button" onClick={() => handleNavigate('companies')}>Companies</button></li>
        <li><button type="button" onClick={() => handleNavigate('api')}>API</button></li>
        <li><button type="button" onClick={() => handleNavigate('docs')}>Docs</button></li>
      </ul>

      <button className={styles.btn} type="button" onClick={() => onGetStarted?.({}, 'jobs')}>
        Get Started →
      </button>
    </nav>
  );
}
