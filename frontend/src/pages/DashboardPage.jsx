import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import JobCard from '../components/JobCard';
import ComboBox from '../components/ComboBox';
import { CATEGORIES, LOCATIONS, EXPERIENCE, ROLE_SUGGESTIONS } from '../data/mockData';
import { appConfig } from '../config/appConfig';
import { loadDashboardStats, loadJobs, triggerScrape } from '../services/jobData';
import styles from './DashboardPage.module.css';

const SECTION_IDS = ['jobs', 'companies', 'saved', 'scrapers', 'analytics', 'api'];

export default function DashboardPage({
  initialFilters = {},
  initialSection = 'jobs',
  onNavigateHome,
}) {
  const [activeNav,    setActiveNav]    = useState('jobs');
  const [search,       setSearch]       = useState(initialFilters.role     || '');
  const [location,     setLocation]     = useState(initialFilters.location || 'All Locations');
  const [experience,   setExperience]   = useState(initialFilters.exp      || 'Experience: All');
  const [category,     setCategory]     = useState('All');
  const [sortBy,       setSortBy]       = useState('Newest');
  const [isScraping,   setIsScraping]   = useState(false);
  const [scrapeMsg,    setScrapeMsg]    = useState('');
  const [jobs,         setJobs]         = useState([]);
  const [totalJobs,    setTotalJobs]    = useState(0);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [limit]                      = useState(20);
  const [stats,        setStats]        = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState('');

  const formatLastScrapeLabel = (value) => {
    if (!value) return 'Never';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Never';
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const startResult = totalJobs === 0 ? 0 : (page - 1) * limit + 1;
  const endResult = Math.min(page * limit, totalJobs);

  useEffect(() => {
    if (!SECTION_IDS.includes(initialSection)) return;
    setActiveNav(initialSection);

    const id = window.setTimeout(() => {
      const section = document.getElementById(initialSection);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, [initialSection]);

  useEffect(() => {
    let cancelled = false;

    async function syncStats() {
      try {
        const nextStats = await loadDashboardStats();
        if (!cancelled) {
          setStats(nextStats);
        }
      } catch (err) {
        if (!cancelled) {
          setStats(null);
        }
      }
    }

    syncStats();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncJobs() {
      setIsLoading(true);
      setError('');

      try {
        const results = await loadJobs({
          role: search,
          location,
          experience,
          category,
          sortBy,
          page,
          limit,
        });

        if (!cancelled) {
          setJobs(results.items);
          setTotalJobs(results.total);
          setTotalPages(results.totalPages);
        }
      } catch (err) {
        if (!cancelled) {
          setError(appConfig.useMockData ? 'Failed to load mock jobs.' : 'Failed to load jobs from API.');
          setJobs([]);
          setTotalJobs(0);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    syncJobs();

    return () => {
      cancelled = true;
    };
  }, [search, location, experience, category, sortBy, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [search, location, experience, category, sortBy]);

  const handleSidebarSelect = (sectionId) => {
    setActiveNav(sectionId);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* ─── Manual scrape trigger ─── */
  const handleScrape = async () => {
    setIsScraping(true);
    setScrapeMsg('Scraping in progress...');

    try {
      const result = await triggerScrape();
      setScrapeMsg(`✓ ${result.message || 'Scrape complete'}`);
      const refreshedJobs = await loadJobs({
        role: search,
        location,
        experience,
        category,
        sortBy,
        page,
        limit,
      });
      setJobs(refreshedJobs.items);
      setTotalJobs(refreshedJobs.total);
      setTotalPages(refreshedJobs.totalPages);
      const nextStats = await loadDashboardStats();
      setStats(nextStats);
    } catch (err) {
      setScrapeMsg('Scrape failed. Check backend connectivity.');
    } finally {
      setIsScraping(false);
      setTimeout(() => setScrapeMsg(''), 4000);
    }
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <Sidebar
        active={activeNav}
        onSelect={handleSidebarSelect}
        onNavigateHome={onNavigateHome}
        stats={stats}
      />

      {/* Main content */}
      <div className={styles.main}>
        {/* Top bar */}
        <header className={styles.topbar}>
          <button className={styles.backBtn} onClick={onNavigateHome} title="Back to home">
            ← Home
          </button>

          <div className={styles.topbarMeta}>
            <div>
              <p className={styles.kicker}>Live Search Dashboard</p>
              <h1 className={styles.heading}>CareerCrawler Jobs</h1>
            </div>
            <div className={styles.statusChip}>
              <span className={styles.statusDot} />
              {stats?.scrapeInProgress ? 'Scrape running' : 'Database live'}
            </div>
          </div>

          <ComboBox
            className={styles.topbarComboWide}
            value={search}
            onChange={setSearch}
            options={ROLE_SUGGESTIONS}
            placeholder="Search roles, skills, companies..."
            icon={(
              <svg width="14" height="14" fill="none" stroke="var(--muted)" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            )}
          />

          <ComboBox
            className={styles.topbarCombo}
            value={location}
            onChange={setLocation}
            options={LOCATIONS}
            placeholder="Location"
          />

          <ComboBox
            className={styles.topbarCombo}
            value={experience}
            onChange={setExperience}
            options={EXPERIENCE}
            placeholder="Experience"
          />

          <button
            className={`${styles.scrapeBtn} ${isScraping ? styles.scraping : ''}`}
            onClick={handleScrape}
            disabled={isScraping}
          >
            {isScraping ? '⏳ Scraping…' : '⚡ Run Scraper'}
          </button>
        </header>

        {/* Scrape message banner */}
        {scrapeMsg && (
          <div className={styles.scrapeBanner}>{scrapeMsg}</div>
        )}

        {/* Content */}
        <div className={styles.content}>
          {/* Stat strip */}
          <div className={styles.statStrip}>
            {[
              { icon: '💼', num: stats?.activeJobs?.toLocaleString() || '0', label: 'Active Jobs', color: '#A78BFA', bg: 'rgba(124,58,237,0.15)' },
              { icon: '🏢', num: stats?.activeCompanies?.toLocaleString() || '0', label: 'Companies', color: '#67E8F9', bg: 'rgba(6,182,212,0.12)' },
              { icon: '🕒', num: stats?.scrapeInProgress ? 'Running' : 'Idle', label: 'Scrape Status', color: '#6EE7B7', bg: 'rgba(52,211,153,0.12)' },
              { icon: '✨', num: formatLastScrapeLabel(stats?.lastScrapedAt), label: 'Last Scrape', color: '#FCD34D', bg: 'rgba(245,158,11,0.12)' },
            ].map((s) => (
              <div key={s.label} className={styles.statTile}>
                <div className={styles.statIcon} style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div className={styles.statNum} style={{ color: s.color }}>{s.num}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Category pills + sort */}
          <div className={styles.filterRow}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.pill} ${category === cat ? styles.pillOn : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
            <div className={styles.sortGroup}>
              <button
                className={`${styles.sortChip} ${sortBy === 'Newest' ? styles.sortActive : ''}`}
                onClick={() => setSortBy('Newest')}
              >
                🗂 Newest
              </button>
              <button
                className={`${styles.sortChip} ${sortBy === 'Experience' ? styles.sortActive : ''}`}
                onClick={() => setSortBy('Experience')}
              >
                🏷 Experience
              </button>
            </div>
          </div>

          {/* List header */}
          <div className={styles.listHeader} id="jobs">
            <div className={styles.listMeta}>
              <span className={styles.listCount}>
                Showing <strong>{startResult}-{endResult}</strong> of <strong>{totalJobs.toLocaleString()}</strong>
              </span>
              <span className={styles.listCount}>
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>
            </div>
            <span className={styles.listCount}>
              Source: <strong>{appConfig.useMockData ? 'Mock Data' : 'Backend API'}</strong>
            </span>
          </div>
          <div className={styles.activeFilters}>
            <span className={styles.filterChip}>{search ? `Query: ${search}` : 'All roles'}</span>
            <span className={styles.filterChip}>{location}</span>
            <span className={styles.filterChip}>{experience}</span>
            <span className={styles.filterChip}>{category}</span>
          </div>

          {/* Job list */}
          {error ? (
            <div className={styles.empty}>
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          ) : isLoading ? (
            <div className={styles.empty}>
              <span>⌛</span>
              <p>Loading jobs...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className={styles.jobList}>
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <span>🕸️</span>
              <p>No jobs found. Try adjusting your filters.</p>
            </div>
          )}

          {/* Pagination */}
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
            >
              ←
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map((n) => (
              <button
                key={n}
                className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            {totalPages > 5 && <span className={styles.pageDots}>…</span>}
            {totalPages > 5 && (
              <button className={styles.pageBtn} onClick={() => setPage(totalPages)}>
                {totalPages}
              </button>
            )}
            <button
              className={styles.pageBtn}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
            >
              →
            </button>
          </div>

          <section className={styles.infoSection} id="companies">
            <div className={styles.sectionHeader}>
              <h2>Tracked Companies</h2>
              <span>{stats?.activeCompanies?.toLocaleString() || '0'} active sources</span>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <strong>Platform coverage</strong>
                <p>Greenhouse, Lever, and Workday sources are active in the current crawl batch.</p>
              </div>
              <div className={styles.infoCard}>
                <strong>Live inventory</strong>
                <p>{stats?.activeJobs?.toLocaleString() || '0'} jobs currently available from the database.</p>
              </div>
            </div>
          </section>

          <section className={styles.infoSection} id="saved">
            <div className={styles.sectionHeader}>
              <h2>Saved Jobs</h2>
              <span>UI-only for now</span>
            </div>
            <div className={styles.infoCard}>
              <p>Saved jobs are currently session-local in the card UI. They are not persisted to the backend yet.</p>
            </div>
          </section>

          <section className={styles.infoSection} id="scrapers">
            <div className={styles.sectionHeader}>
              <h2>Scraper Status</h2>
              <span>{stats?.scrapeInProgress ? 'Running now' : 'Idle'}</span>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <strong>Next run</strong>
                <p>{stats?.nextSchedule || 'Not configured'}</p>
              </div>
              <div className={styles.infoCard}>
                <strong>Last scrape</strong>
                <p>{formatLastScrapeLabel(stats?.lastScrapedAt)}</p>
              </div>
            </div>
          </section>

          <section className={styles.infoSection} id="analytics">
            <div className={styles.sectionHeader}>
              <h2>Analytics</h2>
              <span>Live summary</span>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <strong>Jobs returned</strong>
                <p>{totalJobs.toLocaleString()} jobs match the current filters.</p>
              </div>
              <div className={styles.infoCard}>
                <strong>Current page</strong>
                <p>Showing {startResult}-{endResult} on page {page} of {totalPages}.</p>
              </div>
            </div>
          </section>

          <section className={styles.infoSection} id="api">
            <div className={styles.sectionHeader}>
              <h2>API Links</h2>
              <span>Direct backend endpoints</span>
            </div>
            <div className={styles.infoGrid}>
              <a className={styles.infoLink} href={`${appConfig.apiBaseUrl}/api/health`} target="_blank" rel="noreferrer">
                {appConfig.apiBaseUrl}/api/health
              </a>
              <a className={styles.infoLink} href={`${appConfig.apiBaseUrl}/api/jobs?page=1&limit=20`} target="_blank" rel="noreferrer">
                {appConfig.apiBaseUrl}/api/jobs?page=1&limit=20
              </a>
              <a className={styles.infoLink} href={`${appConfig.apiBaseUrl}/api/stats`} target="_blank" rel="noreferrer">
                {appConfig.apiBaseUrl}/api/stats
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
