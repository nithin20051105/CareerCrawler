import { appConfig } from '../config/appConfig';

async function request(path, options = {}) {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function fetchJobs(filters = {}) {
  const params = new URLSearchParams();

  if (filters.role) params.set('role', filters.role);
  if (filters.location && filters.location !== 'All Locations') {
    params.set('location', filters.location);
  }
  if (filters.experience && filters.experience !== 'Experience: All') {
    params.set('experience', filters.experience);
  }
  params.set('page', String(filters.page || 1));
  params.set('limit', String(filters.limit || 20));

  const query = params.toString();
  return request(`/api/jobs${query ? `?${query}` : ''}`);
}

export async function triggerScrape() {
  return request('/api/scrape', { method: 'POST' });
}

export async function fetchDashboardStats() {
  return request('/api/stats');
}
