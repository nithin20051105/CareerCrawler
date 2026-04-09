import cron from 'node-cron';
import { scrapeAllCompanies, getScrapeState } from '../services/scrapeService.js';

let scrapeJob = null;

export function initializeCronJobs() {
  const schedule = process.env.SCRAPE_CRON || '0 */6 * * *';
  const enabled = (process.env.ENABLE_SCHEDULER || 'true').toLowerCase() === 'true';

  if (!enabled) {
    console.log('Scheduler disabled');
    return;
  }

  if (scrapeJob) return;

  scrapeJob = cron.schedule(schedule, async () => {
    const state = getScrapeState();

    if (state.isRunning) {
      console.log('Skipping scheduled scrape because another run is in progress');
      return;
    }

    try {
      console.log('Starting scheduled scrape');
      await scrapeAllCompanies();
      console.log('Scheduled scrape completed');
    } catch (error) {
      console.error('Scheduled scrape failed:', error);
    }
  });

  console.log(`Scheduler initialized with cron "${schedule}"`);
}
