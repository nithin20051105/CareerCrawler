import { appConfig } from '../config/appConfig';
import {
  fetchDashboardStats,
  fetchJobs,
  triggerScrape as triggerScrapeRequest,
} from './api';
import { JOBS } from '../data/mockData';

const COMPANY_STYLES = [
  { bg: 'rgba(124,58,237,0.2)', text: '#A78BFA', letter: 'S' },
  { bg: 'rgba(6,182,212,0.15)', text: '#67E8F9', letter: 'G' },
  { bg: 'rgba(245,158,11,0.15)', text: '#FCD34D', letter: 'R' },
  { bg: 'rgba(52,211,153,0.15)', text: '#6EE7B7', letter: 'F' },
  { bg: 'rgba(244,114,182,0.15)', text: '#F9A8D4', letter: 'A' },
];

const TAG_STYLES = [
  { bg: 'rgba(124,58,237,0.15)', text: '#A78BFA' },
  { bg: 'rgba(6,182,212,0.12)', text: '#67E8F9' },
  { bg: 'rgba(52,211,153,0.10)', text: '#6EE7B7' },
  { bg: 'rgba(245,158,11,0.12)', text: '#FCD34D' },
  { bg: 'rgba(244,114,182,0.12)', text: '#F9A8D4' },
];

const normalizeString = (value) => (value || '').toString().trim().toLowerCase();

const getCompanyStyle = (company = '') => {
  const seed = company
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  const style = COMPANY_STYLES[seed % COMPANY_STYLES.length];

  return {
    ...style,
    letter: company.slice(0, 2).toUpperCase() || style.letter,
  };
};

const formatScrapedAt = (value) => {
  if (!value) return 'recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};

const formatScrapedAtFull = (value) => {
  if (!value) return 'Time unavailable';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';

  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const normalizeJob = (job, index = 0) => ({
  id: job.id || job._id || `${job.company || 'job'}-${index}`,
  title: job.title || 'Untitled role',
  company: job.company || job.company_name || 'Unknown company',
  location: job.location || 'Unknown',
  experience: job.experience || 'Not specified',
  skills: Array.isArray(job.skills) ? job.skills : [],
  scrapedAtLabel: job.scrapedAt || formatScrapedAt(job.scraped_at),
  scrapedAtFull: formatScrapedAtFull(job.scraped_at || job.scrapedAt),
  sourceJobId: job.source_job_id || job.sourceJobId || job._id || `job-${index + 1}`,
  jobLink: job.jobLink || job.job_link || '#',
  color: job.color || getCompanyStyle(job.company || job.company_name),
  tagColors: job.tagColors || TAG_STYLES,
});

const matchesExperience = (jobExperience, selectedExperience) => {
  if (!selectedExperience || selectedExperience === 'Experience: All') return true;
  return normalizeString(jobExperience) === normalizeString(selectedExperience);
};

const matchesCategory = (job, category) => {
  if (!category || category === 'All') return true;
  const query = normalizeString(category);

  return (
    normalizeString(job.title).includes(query) ||
    (job.skills || []).some((skill) => normalizeString(skill).includes(query))
  );
};

const matchesSearch = (job, role) => {
  const query = normalizeString(role);
  if (!query) return true;

  return (
    normalizeString(job.title).includes(query) ||
    normalizeString(job.company).includes(query) ||
    (job.skills || []).some((skill) => normalizeString(skill).includes(query))
  );
};

const matchesLocation = (job, location) => {
  if (!location || location === 'All Locations') return true;
  return normalizeString(job.location) === normalizeString(location);
};

const sortJobs = (jobs, sortBy) => {
  const items = [...jobs];

  if (sortBy === 'Experience') {
    items.sort((a, b) => a.experience.localeCompare(b.experience));
    return items;
  }

  items.sort((a, b) => b.id.toString().localeCompare(a.id.toString()));
  return items;
};

function filterMockJobs(filters = {}) {
  const filtered = sortJobs(
    JOBS.filter((job) => {
      return (
        matchesSearch(job, filters.role) &&
        matchesLocation(job, filters.location) &&
        matchesExperience(job.experience, filters.experience) &&
        matchesCategory(job, filters.category)
      );
    }),
    filters.sortBy
  );

  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 20);
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return {
    items,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  };
}

export async function loadJobs(filters = {}) {
  if (appConfig.useMockData) {
    return filterMockJobs(filters);
  }

  const response = await fetchJobs(filters);
  const normalized = response.items.map((job, index) => normalizeJob(job, index));
  return {
    ...response,
    items: sortJobs(normalized, filters.sortBy),
  };
}

export async function loadFeaturedJobs(limit = 4) {
  if (appConfig.useMockData) {
    return JOBS.slice(0, limit);
  }

  const response = await fetchJobs({ page: 1, limit });
  return response.items.slice(0, limit).map((job, index) => normalizeJob(job, index));
}

export async function triggerScrape() {
  if (appConfig.useMockData) {
    return {
      message: 'Scrape complete - 34 companies updated',
    };
  }

  return triggerScrapeRequest();
}

export async function loadDashboardStats() {
  if (appConfig.useMockData) {
    return {
      activeJobs: JOBS.length,
      activeCompanies: new Set(JOBS.map((job) => job.company)).size,
      lastScrapedAt: new Date().toISOString(),
      scrapeInProgress: false,
      lastScrapeCompletedAt: new Date().toISOString(),
      nextSchedule: '0 */6 * * *',
    };
  }

  return fetchDashboardStats();
}
