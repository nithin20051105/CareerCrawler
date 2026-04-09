import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Job from '../models/Job.js';

dotenv.config();

async function cleanupGreenhouseJobs() {
  await connectDB();

  const result = await Job.deleteMany({
    scraper_type: 'greenhouse',
  });

  console.log(`Deleted ${result.deletedCount} greenhouse job documents`);
  process.exit(0);
}

cleanupGreenhouseJobs().catch((error) => {
  console.error('Failed to clean greenhouse jobs:', error);
  process.exit(1);
});
