import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractExperienceRange, formatExperience } from '../utils/experience.js';

function cleanText(value = '') {
  return value.replace(/\s+/g, ' ').replace(/\bNew\b\s*$/i, '').trim();
}

function extractRemixContext(html) {
  const marker = 'window.__remixContext = ';
  const startIndex = html.indexOf(marker);

  if (startIndex === -1) return null;

  let cursor = startIndex + marker.length;
  while (cursor < html.length && html[cursor] !== '{') {
    cursor += 1;
  }

  if (cursor >= html.length) return null;

  let depth = 0;
  let inString = false;
  let isEscaped = false;
  let endIndex = cursor;

  for (let index = cursor; index < html.length; index += 1) {
    const char = html[index];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;

    if (depth === 0) {
      endIndex = index + 1;
      break;
    }
  }

  try {
    return JSON.parse(html.slice(cursor, endIndex));
  } catch (error) {
    return null;
  }
}

function parseJobsFromRemixContext(context) {
  const jobs =
    context?.state?.loaderData?.['routes/$url_token']?.openings?.data?.jobs || [];

  return jobs
    .filter((job) => job?.title && job?.absolute_url)
    .map((job) => ({
      title: cleanText(job.title),
      location: cleanText(job.location || 'Unknown'),
      experience: formatExperience(extractExperienceRange(job.title)),
      skills: [],
      job_link: job.absolute_url,
      source_job_id: job.id ? String(job.id) : null,
    }));
}

function parseJobsFromDom(html, careerUrl) {
  const $ = cheerio.load(html);
  const jobs = [];

  $('tr.job-post, .opening, .job-post, .job').each((index, element) => {
    const anchor = $(element).find('a').first();
    const jobLink = anchor.attr('href');

    if (!jobLink) return;

    const title =
      cleanText(anchor.find('p.body.body--medium').first().text()) ||
      cleanText($(element).find('a, h2, h3').first().text());

    const location =
      cleanText(anchor.find('p.body__secondary.body--metadata').first().text()) ||
      cleanText($(element).find('.location').first().text()) ||
      'Unknown';

    if (!title) return;

    jobs.push({
      title,
      location,
      experience: formatExperience(extractExperienceRange(title)),
      skills: [],
      job_link: jobLink.startsWith('http') ? jobLink : new URL(jobLink, careerUrl).toString(),
      source_job_id: null,
    });
  });

  return jobs;
}

export async function scrapeGreenhouseJobs(company) {
  if (!company.career_url) return [];

  const response = await axios.get(company.career_url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  const remixContext = extractRemixContext(response.data);
  const remixJobs = parseJobsFromRemixContext(remixContext);

  if (remixJobs.length > 0) {
    return remixJobs;
  }

  return parseJobsFromDom(response.data, company.career_url);
}
