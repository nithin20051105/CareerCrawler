const MAX_EXPERIENCE = 99;

function cleanText(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

export function parseExperienceFilter(value = '') {
  const normalized = cleanText(value).toLowerCase();

  if (!normalized || normalized === 'experience: all') return null;

  const plusMatch = normalized.match(/(\d+)\s*\+\s*years?/i);
  if (plusMatch) {
    return { min: Number(plusMatch[1]), max: MAX_EXPERIENCE };
  }

  const rangeMatch = normalized.match(/(\d+)\s*[-–]\s*(\d+)\s*years?/i);
  if (rangeMatch) {
    return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
  }

  return null;
}

export function extractExperienceRange(...values) {
  const text = cleanText(values.filter(Boolean).join(' '));
  if (!text) return null;

  const patterns = [
    /(\d+)\s*[-–]\s*(\d+)\s*(?:years?|yrs?|yoe)/i,
    /(\d+)\s*(?:to)\s*(\d+)\s*(?:years?|yrs?|yoe)/i,
    /(\d+)\s*\+\s*(?:years?|yrs?|yoe)/i,
    /minimum of\s*(\d+)\s*(?:years?|yrs?)/i,
    /at least\s*(\d+)\s*(?:years?|yrs?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    if (match[2]) {
      return { min: Number(match[1]), max: Number(match[2]) };
    }

    return { min: Number(match[1]), max: MAX_EXPERIENCE };
  }

  return null;
}

export function formatExperience(range) {
  if (!range) return 'Not specified';
  if (range.max >= MAX_EXPERIENCE) return `${range.min}+ years`;
  return `${range.min}-${range.max} years`;
}

export function matchesExperienceFilter(job, filterValue) {
  const selectedRange = parseExperienceFilter(filterValue);
  if (!selectedRange) return true;

  const jobRange = extractExperienceRange(job.experience, job.title);
  if (!jobRange) return false;

  return jobRange.min <= selectedRange.max && selectedRange.min <= jobRange.max;
}
