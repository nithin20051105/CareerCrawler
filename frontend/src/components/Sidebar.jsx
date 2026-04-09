import React, { useState } from 'react';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { icon: '💼', label: 'Job Listings', badge: '1,247', id: 'jobs'      },
  { icon: '🏢', label: 'Companies',    badge: null,    id: 'companies' },
  { icon: '🔖', label: 'Saved',        badge: null,    id: 'saved'     },
];

const SYSTEM_ITEMS = [
  { icon: '⚙️', label: 'Scrapers',  id: 'scrapers'  },
  { icon: '📊', label: 'Analytics', id: 'analytics' },
  { icon: '🔌', label: 'API',       id: 'api'       },
];

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Not yet run';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Not yet run';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function getNextRunLabel(cronExpression, lastScrapedAt) {
  const fallbackDate = new Date(Date.now() + 6 * 60 * 60 * 1000);
  let nextRunDate = fallbackDate;

  if (cronExpression === '0 */6 * * *') {
    const now = new Date();
    const next = new Date(now);
    next.setMinutes(0, 0, 0);
    const nextBlock = Math.floor(now.getHours() / 6) * 6 + 6;

    if (nextBlock >= 24) {
      next.setDate(next.getDate() + 1);
      next.setHours(nextBlock - 24, 0, 0, 0);
    } else {
      next.setHours(nextBlock, 0, 0, 0);
    }

    nextRunDate = next;
  } else if (lastScrapedAt) {
    const base = new Date(lastScrapedAt);
    if (!Number.isNaN(base.getTime())) {
      nextRunDate = new Date(base.getTime() + 6 * 60 * 60 * 1000);
    }
  }

  return nextRunDate.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function Sidebar({ active = 'jobs', onSelect, onNavigateHome, stats }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeJobCount = stats?.activeJobs?.toLocaleString() || '0';
  const activeCompanyCount = stats?.activeCompanies?.toLocaleString() || '0';
  const scrapeStatus = stats?.scrapeInProgress ? 'Crawler Running' : 'Crawler Idle';
  const lastRun = formatTimeAgo(stats?.lastScrapedAt);
  const nextRun = getNextRunLabel(stats?.nextSchedule, stats?.lastScrapedAt);

  const handleSelect = (id) => {
    onSelect?.(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        className={styles.mobileToggle}
        onClick={() => setIsMobileOpen((open) => !open)}
        aria-label="Toggle dashboard navigation"
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>

      {isMobileOpen && <button className={styles.overlay} onClick={() => setIsMobileOpen(false)} aria-label="Close sidebar" />}

      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`}>
        <button className={styles.logo} type="button" onClick={onNavigateHome}>
          <div className={styles.spiderIcon}>🕷️</div>
          CareerCrawler
        </button>

        <nav className={styles.navSection}>
          <div className={styles.navLabel}>Main</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${active === item.id ? styles.activeItem : ''}`}
              onClick={() => handleSelect(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
              {item.id === 'jobs' ? (
                <span className={styles.badge}>{activeJobCount}</span>
              ) : item.badge ? (
                <span className={styles.badge}>{item.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <nav className={styles.navSection}>
          <div className={styles.navLabel}>System</div>
          {SYSTEM_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${active === item.id ? styles.activeItem : ''}`}
              onClick={() => handleSelect(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.bottom}>
          <div className={styles.statusCard}>
            <div className={styles.statusRow}>
              <span className={styles.dotPulse} />
              <span className={styles.statusText}>{scrapeStatus}</span>
            </div>
            <div className={styles.statusSub}>
              Next run: {nextRun}
              <br />
              Last: {lastRun}
            </div>
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Live jobs</span>
              <strong>{activeJobCount}</strong>
            </div>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Companies</span>
              <strong>{activeCompanyCount}</strong>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
