export interface ExtractedJobData {
  title: string;
  company: string;
  location: string;
  workType: 'Remote' | 'Hybrid' | 'On-site';
  salary?: string;
  sourceTag: string;
  applyUrl: string;
  notes: string;
}

/**
 * Decode HTML entities like &amp;, &quot;, &#39;
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Identify job platform from URL hostname
 */
function detectPlatform(hostname: string): string {
  const h = hostname.toLowerCase();
  if (h.includes('linkedin')) return 'LinkedIn';
  if (h.includes('glints')) return 'Glints';
  if (h.includes('jobstreet')) return 'JobStreet';
  if (h.includes('kalibrr')) return 'Kalibrr';
  if (h.includes('dealls')) return 'Dealls';
  if (h.includes('kitalulus')) return 'KitaLulus';
  if (h.includes('indeed')) return 'Indeed';
  if (h.includes('techinasia')) return 'Tech in Asia';
  if (h.includes('glassdoor')) return 'Glassdoor';
  if (h.includes('disnaker') || h.includes('kemnaker')) return 'Kemnaker';

  // Fallback: clean domain name (e.g. careers.telkom.co.id -> Telkom Careers)
  const parts = h.replace(/^www\./, '').split('.');
  if (parts.length >= 2) {
    const main = parts[0] === 'careers' || parts[0] === 'jobs' ? parts[1] : parts[0];
    return main.charAt(0).toUpperCase() + main.slice(1);
  }
  return 'Web Karir';
}

/**
 * Fallback to parse Job Title & Company from URL path slug
 */
function parseFromSlug(pathname: string, sourceTag: string): { title?: string; company?: string } {
  try {
    const slug = decodeURIComponent(pathname)
      .split('/')
      .filter(Boolean)
      .pop() || '';

    // Remove file extensions or trailing IDs like -12345
    const cleanSlug = slug.replace(/\.[a-z]+$/i, '').replace(/-\d{6,}$/, '');
    const tokens = cleanSlug.split(/[-_]/).filter(Boolean);

    // If slug has 'at' or 'di' (e.g. frontend-developer-at-tokopedia)
    const atIdx = tokens.findIndex((t) => t.toLowerCase() === 'at' || t.toLowerCase() === 'di');
    if (atIdx > 0 && atIdx < tokens.length - 1) {
      const title = tokens.slice(0, atIdx).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const company = tokens.slice(atIdx + 1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return { title, company };
    }

    if (tokens.length >= 2) {
      const capitalized = tokens.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return { title: capitalized };
    }
  } catch {
    // fallback
  }
  return {};
}

/**
 * Detect location from text
 */
function detectLocation(text: string): string {
  const lower = text.toLowerCase();
  const indonesianCities = [
    'Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara', 'Jakarta',
    'Tangerang Selatan', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Bandung',
    'Surabaya', 'Semarang', 'Yogyakarta', 'Jogja', 'Solo', 'Surakarta',
    'Bali', 'Denpasar', 'Medan', 'Makassar', 'Palembang', 'Malang', 'Batam'
  ];

  for (const city of indonesianCities) {
    if (lower.includes(city.toLowerCase())) {
      return city;
    }
  }

  if (lower.includes('remote') || lower.includes('wfh')) {
    return 'Remote (Indonesia)';
  }

  return 'Jakarta / Fleksibel';
}

/**
 * Detect work mode (Remote / Hybrid / On-site)
 */
function detectWorkType(text: string): 'Remote' | 'Hybrid' | 'On-site' {
  const lower = text.toLowerCase();
  if (lower.includes('remote') || lower.includes('wfh') || lower.includes('work from home')) {
    return 'Remote';
  }
  if (lower.includes('hybrid')) {
    return 'Hybrid';
  }
  if (lower.includes('on-site') || lower.includes('onsite') || lower.includes('wfo') || lower.includes('kantor')) {
    return 'On-site';
  }
  return 'Remote';
}

/**
 * Detect salary estimate from text
 */
function detectSalary(text: string): string | undefined {
  // e.g. Rp 15.000.000 - Rp 25.000.000 or 15 - 25 jt or IDR 12jt
  const jtRegex = /(?:idr|rp\.?|gaji)?\s*(\d{1,3}(?:[.,]\d+)?)\s*(?:-|sampai|to)\s*(\d{1,3}(?:[.,]\d+)?)\s*(?:jt|juta)/i;
  const matchJt = text.match(jtRegex);
  if (matchJt) {
    return `${matchJt[1]}-${matchJt[2]}jt`;
  }

  const singleJt = /(?:idr|rp\.?)?\s*(\d{1,3})\s*(?:jt|juta)/i;
  const matchSingle = text.match(singleJt);
  if (matchSingle) {
    return `~${matchSingle[1]}jt`;
  }

  const fullRp = /rp\.?\s*(\d{1,3}(?:\.\d{3})+)/i;
  const matchRp = text.match(fullRp);
  if (matchRp) {
    return matchRp[0];
  }

  return undefined;
}

/**
 * Parse raw HTML and extract job details
 */
export async function extractJobFromUrl(rawUrl: string): Promise<ExtractedJobData> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
  } catch {
    throw new Error('URL yang dimasukkan tidak valid');
  }

  const sourceTag = detectPlatform(parsedUrl.hostname);
  let html = '';
  let fetchError = false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      html = await response.text();
    } else {
      fetchError = true;
    }
  } catch (err) {
    fetchError = true;
  }

  // Extract meta tags from HTML
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  const twitterTitleMatch = html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
  const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

  const ogSiteNameMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
  const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

  const rawTitle = ogTitleMatch?.[1] || twitterTitleMatch?.[1] || titleTagMatch?.[1] || '';
  const cleanTitleStr = decodeHtmlEntities(rawTitle);

  const siteName = decodeHtmlEntities(ogSiteNameMatch?.[1] || '');
  const description = decodeHtmlEntities(ogDescMatch?.[1] || '');

  let title = '';
  let company = '';

  // Clean brand suffix from title like " | LinkedIn", " - Glints", " | JobStreet"
  let workingTitle = cleanTitleStr
    .replace(/\s*[-|–—]\s*(LinkedIn|Glints|JobStreet|Kalibrr|Dealls|KitaLulus|Indeed|Glassdoor).*$/i, '')
    .trim();

  // Pattern 1: "{Company} hiring {Role} in {Location}" (LinkedIn common format)
  const hiringMatch = workingTitle.match(/^(.*?)\s+(?:is\s+)?hiring\s+(?:a\s+|an\s+)?(.*?)(?:\s+in\s+.*)?$/i);
  if (hiringMatch) {
    company = hiringMatch[1].trim();
    title = hiringMatch[2].trim();
  }

  // Pattern 2: "{Role} at {Company}" (LinkedIn / standard format)
  if (!title && workingTitle.includes(' at ')) {
    const parts = workingTitle.split(/\s+at\s+/i);
    title = parts[0].trim();
    company = parts[1]?.trim() || '';
  }

  // Pattern 3: "{Role} di {Company}" or "{Role} pada {Company}" (Indonesian format)
  if (!title && (workingTitle.includes(' di ') || workingTitle.includes(' pada '))) {
    const parts = workingTitle.split(/\s+(?:di|pada)\s+/i);
    title = parts[0].trim();
    company = parts[1]?.trim() || '';
  }

  // Pattern 4: "{Role} - {Company}"
  if (!title && workingTitle.includes(' - ')) {
    const parts = workingTitle.split(' - ');
    title = parts[0].trim();
    company = parts[1]?.trim() || '';
  }

  // Pattern 5: "{Role} | {Company}"
  if (!title && workingTitle.includes(' | ')) {
    const parts = workingTitle.split(' | ');
    title = parts[0].trim();
    company = parts[1]?.trim() || '';
  }

  // Fallback: If company still empty but siteName has company
  if (!company && siteName && siteName.toLowerCase() !== sourceTag.toLowerCase()) {
    company = siteName;
  }

  // If title still empty, use workingTitle
  if (!title && workingTitle) {
    title = workingTitle;
  }

  // If fetch failed or yielded empty data, fallback to URL slug parsing
  if (!title || !company) {
    const slugData = parseFromSlug(parsedUrl.pathname, sourceTag);
    if (!title && slugData.title) title = slugData.title;
    if (!company && slugData.company) company = slugData.company;
  }

  // Defaults if still empty
  if (!title) title = 'Posisi Pekerjaan';
  if (!company) company = sourceTag !== 'Web Karir' ? `Perusahaan di ${sourceTag}` : 'Nama Perusahaan';

  const combinedContext = `${title} ${company} ${description}`;
  const location = detectLocation(combinedContext);
  const workType = detectWorkType(combinedContext);
  const salary = detectSalary(combinedContext);

  const notes = description
    ? `Ditarik otomatis dari ${sourceTag}:\n${description.slice(0, 300)}${description.length > 300 ? '...' : ''}`
    : `Ditarik otomatis dari ${sourceTag}.`;

  return {
    title,
    company,
    location,
    workType,
    salary,
    sourceTag,
    applyUrl: parsedUrl.toString(),
    notes,
  };
}
