import axios from 'axios';
import { extractExperienceRange, formatExperience } from '../utils/experience.js';

function normalizeSkills(description = '') {
  const matches = description.match(/\b(JavaScript|TypeScript|React|Node\.js|Node|Python|Java|Go|Rust|AWS|GCP|Azure|Kubernetes|Docker|MongoDB|PostgreSQL|GraphQL|TensorFlow|PyTorch)\b/gi);

  if (!matches) return [];

  return [...new Set(matches.map((skill) => skill.trim()))];
}

export async function scrapeLeverJobs(company) {
  const leverSlug = company.lever_slug;

  if (!leverSlug) {
    throw new Error(`Missing lever_slug for ${company.company_name}`);
  }

  const response = await axios.get(`https://api.lever.co/v0/postings/${leverSlug}?mode=json`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  });

  return response.data
    .filter((job) => job?.text && job?.hostedUrl)
    .map((job) => ({
      title: job.text.trim(),
      location: job.categories?.location?.trim() || 'Unknown',
      experience: formatExperience(
        extractExperienceRange(job.text, job.descriptionPlain) ||
        extractExperienceRange(job.categories?.commitment)
      ),
      skills: normalizeSkills(job.descriptionPlain || ''),
      job_link: job.hostedUrl,
      source_job_id: job.id || null,
    }));
}
