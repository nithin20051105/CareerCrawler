import { Router } from 'express';
import {
  getDashboardStats,
  getAllJobs,
  getJobs,
  getScrapeStatus,
  triggerScrape,
} from '../controllers/jobController.js';

const router = Router();

router.get('/jobs', getJobs);
router.get('/jobs/all', getAllJobs);
router.get('/stats', getDashboardStats);
router.get('/scrape/status', getScrapeStatus);
router.post('/scrape', triggerScrape);

export default router;
