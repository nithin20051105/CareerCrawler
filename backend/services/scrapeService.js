import Company from '../models/Company.js';
import Job from '../models/Job.js';
import { runWithConcurrencyLimit } from '../utils/concurrencyLimiter.js';
import { scrapeAmazonJobs } from '../scrapers/amazonScraper.js';
import { scrapeGoogleJobs } from '../scrapers/googleScraper.js';
import { scrapeGreenhouseJobs } from '../scrapers/greenhouseScraper.js';
import { scrapeLeverJobs } from '../scrapers/leverScraper.js';
import { scrapeStripeJobs } from '../scrapers/stripeScraper.js';
import { scrapeWorkdayJobs } from '../scrapers/workdayScraper.js';

const scraperRegistry = {
  amazon: scrapeAmazonJobs,
  cheerio: scrapeGreenhouseJobs,
  google: scrapeGoogleJobs,
  greenhouse: scrapeGreenhouseJobs,
  lever: scrapeLeverJobs,
  stripe: scrapeStripeJobs,
  workday: scrapeWorkdayJobs,
};

const scrapeState = {
  isRunning: false,
  startedAt: null,
  completedAt: null,
  companiesProcessed: 0,
  jobsUpserted: 0,
  errors: [],
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function upsertJobs(company, jobs = []) {
  let count = 0;

  for (const job of jobs) {
    const payload = {
      company: company.company_name,
      title: job.title,
      location: job.location || 'Unknown',
      experience: job.experience || 'Not specified',
      skills: Array.isArray(job.skills) ? job.skills : [],
      job_link: job.job_link,
      source_job_id: job.source_job_id || null,
      scraper_type: company.scraper_type,
      scraped_at: new Date(),
      is_active: true,
    };

    await Job.updateOne(
      {
        company: payload.company,
        title: payload.title,
        location: payload.location,
        job_link: payload.job_link,
      },
      { $set: payload },
      { upsert: true }
    );

    count += 1;
  }

  return count;
}

async function scrapeCompany(company, delayMs) {
  const scraper = scraperRegistry[company.scraper_type];

  if (!scraper) {
    throw new Error(`No scraper registered for type "${company.scraper_type}"`);
  }

  await delay(delayMs);

  const jobs = await scraper(company);
  const jobsUpserted = await upsertJobs(company, jobs);

  await Company.updateOne(
    { _id: company._id },
    {
      $set: {
        last_scraped_at: new Date(),
        last_scrape_status: 'success',
      },
    }
  );

  return { jobsUpserted };
}

export async function scrapeAllCompanies() {
  const companies = await Company.find({ is_active: true }).lean();
  const concurrency = Number(process.env.SCRAPE_CONCURRENCY || 5);
  const delayMs = Number(process.env.SCRAPE_DELAY_MS || 2000);

  scrapeState.isRunning = true;
  scrapeState.startedAt = new Date().toISOString();
  scrapeState.completedAt = null;
  scrapeState.companiesProcessed = 0;
  scrapeState.jobsUpserted = 0;
  scrapeState.errors = [];

  try {
    const results = await runWithConcurrencyLimit(
      companies,
      concurrency,
      async (company) => {
        try {
          const result = await scrapeCompany(company, delayMs);
          scrapeState.companiesProcessed += 1;
          scrapeState.jobsUpserted += result.jobsUpserted;
          return result;
        } catch (error) {
          scrapeState.errors.push({
            company: company.company_name,
            error: error.message,
          });

          await Company.updateOne(
            { _id: company._id },
            {
              $set: {
                last_scraped_at: new Date(),
                last_scrape_status: 'failed',
              },
            }
          );

          return null;
        }
      }
    );

    scrapeState.completedAt = new Date().toISOString();

    return {
      companiesProcessed: scrapeState.companiesProcessed,
      jobsUpserted: scrapeState.jobsUpserted,
      completedAt: scrapeState.completedAt,
      errors: scrapeState.errors,
      resultsCount: results.filter(Boolean).length,
    };
  } finally {
    scrapeState.isRunning = false;
  }
}

export function getScrapeState() {
  return { ...scrapeState };
}
