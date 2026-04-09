import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db.js';
import jobRoutes from './routes/jobRoutes.js';
import { initializeCronJobs } from './scheduler/cronJobs.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'careercrawler-backend',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', jobRoutes);

async function startServer() {
  await connectDB();
  initializeCronJobs();

  app.listen(port, () => {
    console.log(`CareerCrawler backend listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
