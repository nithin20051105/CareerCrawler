# CareerCrawler Backend

Node.js + Express backend for scheduled job scraping and job search APIs.

## Environment

Create `backend/.env` from `.env.example`:

```bash
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/careercrawler
SCRAPE_CRON=0 */6 * * *
SCRAPE_CONCURRENCY=5
SCRAPE_DELAY_MS=2000
ENABLE_SCHEDULER=true
```

## Scripts

```bash
npm install
npm run seed:companies
npm run dev
```

## Current Seed Batch

The initial company seed list is in `data/companies.js` and starts with Greenhouse-hosted companies so one scraper can support multiple employers.

## API

- `GET /api/health`
- `GET /api/jobs`
- `GET /api/jobs/all`
- `GET /api/scrape/status`
- `POST /api/scrape`
