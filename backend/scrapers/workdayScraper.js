import axios from 'axios';
import { extractExperienceRange, formatExperience } from '../utils/experience.js';

function normalizeSkills(title = '') {
  const matches = title.match(/\b(Java|Python|React|Node|Node\.js|Go|AWS|Azure|Kubernetes|DevOps|Data|Security|Engineer|Developer|Architect|Manager)\b/gi);
  if (!matches) return [];
  return [...new Set(matches.map((skill) => skill.trim()))];
}

function buildJobLink(careerUrl, externalPath) {
  if (!externalPath) return careerUrl;
  return `${careerUrl.replace(/\/$/, '')}${externalPath}`;
}

export async function scrapeWorkdayJobs(company) {
  if (!company.workday_api_url) {
    throw new Error(`Missing workday_api_url for ${company.company_name}`);
  }

  const response = await axios.post(
    company.workday_api_url,
    {},
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );

  const jobs = response.data?.jobPostings || [];

  return jobs
    .filter((job) => job?.title && job?.externalPath)
    .map((job) => ({
      title: job.title.trim(),
      location: job.locationsText?.trim() || 'Unknown',
      experience: formatExperience(extractExperienceRange(job.title)) || 'Not specified',
      skills: normalizeSkills(job.title),
      job_link: buildJobLink(company.career_url, job.externalPath),
      source_job_id: job.bulletFields?.[0] || null,
    }));
}
