import Job from '../models/Job.js';
import Company from '../models/Company.js';
import { scrapeAllCompanies, getScrapeState } from '../services/scrapeService.js';
import { matchesExperienceFilter } from '../utils/experience.js';

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildJobQuery({ role, location, category }) {
  const query = { is_active: true };

  if (role) {
    const regex = new RegExp(escapeRegex(role), 'i');
    query.$or = [{ title: regex }, { company: regex }, { skills: regex }];
  }

  if (location) {
    query.location = new RegExp(escapeRegex(location), 'i');
  }

  if (category && category !== 'All') {
    const regex = new RegExp(escapeRegex(category), 'i');
    query.$and = [...(query.$and || []), { $or: [{ title: regex }, { skills: regex }] }];
  }

  return query;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export async function getJobs(req, res) {
  try {
    const {
      role = '',
      location = '',
      experience = '',
      category = '',
      page = '1',
      limit = '20',
    } = req.query;

    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = Math.min(parsePositiveInt(limit, 20), 100);
    const skip = (pageNumber - 1) * limitNumber;
    const query = buildJobQuery({ role, location, category });

    const jobs = await Job.find(query)
      .sort({ scraped_at: -1 })
      .lean();

    const filteredJobs = jobs.filter((job) => matchesExperienceFilter(job, experience));
    const total = filteredJobs.length;
    const paginatedJobs = filteredJobs.slice(skip, skip + limitNumber);

    res.json({
      items: paginatedJobs,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.max(1, Math.ceil(total / limitNumber)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
  }
}

export async function getAllJobs(req, res) {
  try {
    const jobs = await Job.find({ is_active: true }).sort({ scraped_at: -1 }).lean();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all jobs', error: error.message });
  }
}

export async function getDashboardStats(req, res) {
  try {
    const scrapeState = getScrapeState();

    const [activeJobs, activeCompanies, latestJob, latestCompany] = await Promise.all([
      Job.countDocuments({ is_active: true }),
      Company.countDocuments({ is_active: true }),
      Job.findOne({ is_active: true }).sort({ scraped_at: -1 }).lean(),
      Company.findOne({ is_active: true, last_scraped_at: { $ne: null } }).sort({ last_scraped_at: -1 }).lean(),
    ]);

    res.json({
      activeJobs,
      activeCompanies,
      lastScrapedAt: latestCompany?.last_scraped_at || latestJob?.scraped_at || null,
      scrapeInProgress: scrapeState.isRunning,
      lastScrapeCompletedAt: scrapeState.completedAt || null,
      nextSchedule: process.env.SCRAPE_CRON || '0 */6 * * *',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
}

export async function triggerScrape(req, res) {
  try {
    const state = getScrapeState();

    if (state.isRunning) {
      return res.status(409).json({
        message: 'Scrape already in progress',
        startedAt: state.startedAt,
      });
    }

    const result = await scrapeAllCompanies();

    return res.status(202).json({
      message: `Scrape complete - ${result.companiesProcessed} companies processed`,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to trigger scrape',
      error: error.message,
    });
  }
}

export async function getScrapeStatus(req, res) {
  try {
    res.json(getScrapeState());
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch scrape status', error: error.message });
  }
}
