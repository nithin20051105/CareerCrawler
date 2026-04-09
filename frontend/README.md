# CareerCrawler 🕷️

A sleek job aggregator frontend built with React + Vite.

## Project Structure

```
careercrawler/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx               # Root with client-side routing
    ├── styles/
    │   └── global.css        # CSS variables, resets, keyframes
    ├── data/
    │   └── mockData.js       # Mock jobs, companies, filter options
    ├── components/
    │   ├── Navbar.jsx        # Top navigation (homepage)
    │   ├── Navbar.module.css
    │   ├── Sidebar.jsx       # Left sidebar (dashboard)
    │   ├── Sidebar.module.css
    │   ├── JobCard.jsx       # Reusable job row card
    │   └── JobCard.module.css
    └── pages/
        ├── HomePage.jsx          # Landing page
        ├── HomePage.module.css
        ├── DashboardPage.jsx     # Job listings dashboard
        └── DashboardPage.module.css
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
http://localhost:5173
```

## Connecting to your backend

Create a `.env` file in `frontend/` and switch the app mode there:

```bash
VITE_USE_MOCK_DATA=true
VITE_API_BASE_URL=http://localhost:5000
```

- Set `VITE_USE_MOCK_DATA=true` to use local mock jobs
- Set `VITE_USE_MOCK_DATA=false` to call the backend API
- `VITE_API_BASE_URL` controls which backend base URL is used

Replace the mock data in `src/data/mockData.js` with real API calls.

Example — fetching jobs from your Express backend:

```js
// src/services/api.js
const BASE = 'http://localhost:5000';

export async function getJobs({ role = '', location = '', experience = '' } = {}) {
  const params = new URLSearchParams({ role, location, experience });
  const res = await fetch(`${BASE}/api/jobs?${params}`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function triggerScrape() {
  const res = await fetch(`${BASE}/api/scrape`, { method: 'POST' });
  if (!res.ok) throw new Error('Scrape failed');
  return res.json();
}
```

Then in `DashboardPage.jsx`, replace the mock filter logic with:

```js
const [jobs, setJobs] = useState([]);

useEffect(() => {
  getJobs({ role: search, location, experience })
    .then(setJobs)
    .catch(console.error);
}, [search, location, experience]);
```

## Tech Stack

- **Framework**: React 18
- **Build tool**: Vite 5
- **Styling**: CSS Modules
- **Fonts**: Syne (display) + Space Mono (code/mono)
- **Icons**: Inline SVG
- **Routing**: Simple useState-based (swap for React Router if needed)
