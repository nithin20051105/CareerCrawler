# CareerCrawler

CareerCrawler is a full-stack job aggregation platform that scrapes live job listings from multiple company career portals, stores them in MongoDB, and exposes a searchable dashboard through a React frontend.

The project currently supports:

- `Frontend`: React + Vite
- `Backend`: Node.js + Express
- `Database`: MongoDB Atlas
- `Scraper platforms`: Greenhouse, Lever, Workday
- `Deployment`: Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Live Deployment

- Frontend: `https://career-crawler-6tga.vercel.app/`
- Backend: `https://career-crawler-1.onrender.com/`

## Features

- Search jobs by role, location, experience, and category
- Background scraping on a cron schedule
- Manual scrape trigger through the dashboard or API
- MongoDB-backed search for fast UI responses
- Pagination for scalable job listing queries
- Dashboard stats for active jobs, active companies, and scrape status
- Support for multiple scraper platforms through a registry-based backend

## Architecture

```text
User
  |
  v
React Frontend (Vercel)
  |
  v
Node.js + Express API (Render)
  |
  +--> Scraper Service
  |      |
  |      +--> Greenhouse
  |      +--> Lever
  |      +--> Workday
  |
  v
MongoDB Atlas
```

## Data Flow

1. A scheduled job runs every 6 hours.
2. The backend loads active companies from MongoDB.
3. Each company is processed by the scraper registered for its `scraper_type`.
4. Jobs are normalized and upserted into the `jobs` collection.
5. The frontend queries `/api/jobs` and `/api/stats`.
6. Users browse live results from the database instead of waiting on live scraping.

## Project Structure

```text
Career-Crawler/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── models/
│   ├── routes/
│   ├── scheduler/
│   ├── scrapers/
│   ├── scripts/
│   ├── services/
│   ├── utils/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Backend

### Tech Stack

- Express
- Mongoose
- Axios
- Cheerio
- node-cron

### Current Scraper Support

#### Greenhouse

- Stripe
- Airtable
- Datadog
- Rubrik
- MongoDB
- Figma
- Postman

#### Lever

- Dun & Bradstreet
- Mistral AI

#### Workday

- Workday
- Hitachi Energy

### Core Backend Files

- `backend/server.js`: app bootstrap and server startup
- `backend/config/db.js`: MongoDB connection
- `backend/controllers/jobController.js`: API logic
- `backend/routes/jobRoutes.js`: API routes
- `backend/services/scrapeService.js`: scraper orchestration and upsert flow
- `backend/scheduler/cronJobs.js`: cron scheduling
- `backend/models/Job.js`: job schema
- `backend/models/Company.js`: company schema
- `backend/data/companies.js`: seed company list

### Job Schema

```json
{
  "company": "Airtable",
  "title": "Software Engineer, Product Backend (2-8 YOE)",
  "location": "San Francisco, CA; New York, NY; Remote (Seattle, WA only)",
  "experience": "2-8 years",
  "skills": [],
  "job_link": "https://job-boards.greenhouse.io/airtable/jobs/7845291002",
  "source_job_id": "7845291002",
  "scraper_type": "greenhouse",
  "scraped_at": "2026-03-13T16:58:10.623Z",
  "is_active": true
}
```

### Company Schema

```json
{
  "company_name": "Workday",
  "career_url": "https://workday.wd5.myworkdayjobs.com/en-US/Workday",
  "workday_api_url": "https://workday.wd5.myworkdayjobs.com/wday/cxs/workday/Workday/jobs",
  "scraper_type": "workday",
  "is_active": true,
  "last_scraped_at": "2026-03-13T17:50:46.317Z",
  "last_scrape_status": "success"
}
```

## Frontend

### Tech Stack

- React 18
- Vite 5
- CSS Modules

### Main Screens

- `HomePage`: project landing page and search entry point
- `DashboardPage`: live job dashboard with filters, stats, pagination, and scraper trigger

### Core Frontend Files

- `frontend/src/App.jsx`: app-level navigation between home and dashboard
- `frontend/src/pages/HomePage.jsx`: landing page
- `frontend/src/pages/DashboardPage.jsx`: jobs dashboard
- `frontend/src/components/Navbar.jsx`: homepage navigation
- `frontend/src/components/Sidebar.jsx`: dashboard navigation
- `frontend/src/components/JobCard.jsx`: job display card
- `frontend/src/services/api.js`: backend API calls
- `frontend/src/services/jobData.js`: normalization layer between API and UI

## API Documentation

Base URL:

- Local: `http://localhost:5000`
- Production: `https://career-crawler-1.onrender.com`

### `GET /api/health`

Health check endpoint.

Example response:

```json
{
  "status": "ok",
  "service": "careercrawler-backend",
  "timestamp": "2026-03-13T16:40:37.259Z"
}
```

### `GET /api/jobs`

Fetch paginated, filtered jobs.

Query parameters:

- `role`
- `location`
- `experience`
- `category`
- `page`
- `limit`

Example:

```text
/api/jobs?role=backend&location=India&experience=1-3%20years&page=1&limit=20
```

Example response:

```json
{
  "items": [],
  "total": 506,
  "page": 1,
  "limit": 20,
  "totalPages": 26
}
```

### `GET /api/jobs/all`

Returns all active jobs without pagination.

### `GET /api/stats`

Returns dashboard metrics.

Example response:

```json
{
  "activeJobs": 506,
  "activeCompanies": 11,
  "lastScrapedAt": "2026-03-13T17:50:46.317Z",
  "scrapeInProgress": false,
  "lastScrapeCompletedAt": null,
  "nextSchedule": "0 */6 * * *"
}
```

### `GET /api/scrape/status`

Returns the current in-memory scrape state.

### `POST /api/scrape`

Triggers a manual scrape.

Example response:

```json
{
  "message": "Scrape complete - 11 companies processed",
  "companiesProcessed": 11,
  "jobsUpserted": 506,
  "completedAt": "2026-03-13T17:50:46.317Z",
  "errors": [],
  "resultsCount": 11
}
```

## Local Development

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas cluster

### 1. Clone the repository

```bash
git clone https://github.com/CodeCrest404/Career-Crawler.git
cd Career-Crawler
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```bash
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/careercrawler?retryWrites=true&w=majority
SCRAPE_CRON=0 */6 * * *
SCRAPE_CONCURRENCY=5
SCRAPE_DELAY_MS=2000
ENABLE_SCHEDULER=true
```

Seed companies:

```bash
npm run seed:companies
```

Start backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```bash
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:5000
```

Start frontend:

```bash
npm run dev
```

### 4. Open the app

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Deployment Guide

### MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Allow network access for your Render service.
4. Copy the Mongo connection string.
5. Use a database name such as `careercrawler`.

Example:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/careercrawler?retryWrites=true&w=majority
```

### Backend Deployment on Render

Create a new `Web Service` from the GitHub repository.

Recommended settings:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables:

```bash
PORT=10000
MONGODB_URI=<your atlas uri>
SCRAPE_CRON=0 */6 * * *
SCRAPE_CONCURRENCY=5
SCRAPE_DELAY_MS=2000
ENABLE_SCHEDULER=true
```

Notes:

- Render automatically injects `PORT`; if you keep it in env, make sure your code still reads `process.env.PORT`.
- Scheduled scrapes only work while the backend service is running.
- If your plan sleeps when idle, the cron job may not run until traffic wakes the service up.

After deploy:

- Health check: `https://career-crawler-1.onrender.com/api/health`
- Stats: `https://career-crawler-1.onrender.com/api/stats`

### Frontend Deployment on Vercel

Create a new Vercel project from the same repository.

Recommended settings:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variables:

```bash
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=https://career-crawler-1.onrender.com
```

After deploy:

- Frontend URL: `https://career-crawler-6tga.vercel.app/`

## Production Checklist

- Rotate any database credentials that were ever exposed
- Set `VITE_API_BASE_URL` to the Render backend URL
- Confirm `MONGODB_URI` is set correctly on Render
- Confirm CORS allows frontend access if you later restrict origins
- Seed companies in production at least once
- Verify:
  - `/api/health`
  - `/api/stats`
  - `/api/jobs`
  - `/api/scrape`

## Known Limitations

- `lastScrapeCompletedAt` is currently in-memory and resets on backend restart
- saved jobs are UI-only and not persisted
- location normalization can still be improved for some Workday values
- the custom dropdown UI still needs refinement
- Google and Amazon custom scrapers are not implemented yet

## Future Improvements

- Persist scrape run history
- Add Google and Amazon scrapers
- Add more India-heavy MNCs
- Normalize locations and experience values further
- Persist saved jobs per user
- Add resume parsing and skill-gap analysis

## Security Note

Do not commit real secrets to:

- `backend/.env`
- `frontend/.env`
- `.env.example`

If any MongoDB password or API key has already been exposed, rotate it immediately in the provider dashboard and update the deployment environment variables.
