import { WorkType } from '../types/job';

export interface ParsedJobInfo {
  title: string;
  company: string;
  location: string;
  workType: WorkType;
  salary: string;
  sourceTag: string;
  applyUrl: string;
  notes: string;
}

const INDONESIAN_CITIES = [
  'Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara', 'Jakarta',
  'Tangerang Selatan', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Bandung',
  'Surabaya', 'Semarang', 'Yogyakarta', 'Jogja', 'Solo', 'Surakarta',
  'Bali', 'Denpasar', 'Medan', 'Makassar', 'Palembang', 'Malang', 'Batam'
];

/**
 * Intelligent client-side parser for job postings copied from WhatsApp, Telegram, LinkedIn feeds, etc.
 */
export function parseJobText(rawText: string): ParsedJobInfo {
  const text = rawText.trim();
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let title = '';
  let company = '';
  let location = '';
  let workType: WorkType = 'Remote';
  let salary = '';
  let sourceTag = 'Pesan / Broadcast';
  let applyUrl = '';
  const notesLines: string[] = [];

  // Extract URLs
  const urlMatch = text.match(/https?:\/\/[^\s<>"\']+/i);
  if (urlMatch) {
    applyUrl = urlMatch[0];
    const lowerUrl = applyUrl.toLowerCase();
    if (lowerUrl.includes('linkedin')) sourceTag = 'LinkedIn';
    else if (lowerUrl.includes('glints')) sourceTag = 'Glints';
    else if (lowerUrl.includes('jobstreet')) sourceTag = 'JobStreet';
    else if (lowerUrl.includes('kalibrr')) sourceTag = 'Kalibrr';
    else if (lowerUrl.includes('dealls')) sourceTag = 'Dealls';
    else if (lowerUrl.includes('kitalulus')) sourceTag = 'KitaLulus';
    else sourceTag = 'Web Karir';
  } else {
    // Check for email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      applyUrl = `mailto:${emailMatch[0]}`;
      notesLines.push(`Email Pendaftaran: ${emailMatch[0]}`);
    }
  }

  // Detect platform mentions in text if not from URL
  if (sourceTag === 'Pesan / Broadcast') {
    const lower = text.toLowerCase();
    if (lower.includes('linkedin')) sourceTag = 'LinkedIn';
    else if (lower.includes('telegram')) sourceTag = 'Telegram';
    else if (lower.includes('whatsapp') || lower.includes('wa group')) sourceTag = 'WhatsApp';
    else if (lower.includes('glints')) sourceTag = 'Glints';
    else if (lower.includes('jobstreet')) sourceTag = 'JobStreet';
  }

  // Work Mode detection
  const lowerFull = text.toLowerCase();
  if (lowerFull.includes('remote') || lowerFull.includes('wfh') || lowerFull.includes('work from home')) {
    workType = 'Remote';
  } else if (lowerFull.includes('hybrid')) {
    workType = 'Hybrid';
  } else if (lowerFull.includes('on-site') || lowerFull.includes('onsite') || lowerFull.includes('wfo') || lowerFull.includes('kantor')) {
    workType = 'On-site';
  }

  // Salary detection
  const jtRegex = /(?:gaji|salary|idr|rp\.?|budget)?\s*(\d{1,3}(?:[.,]\d+)?)\s*(?:-|sampai|to|s\/d)\s*(\d{1,3}(?:[.,]\d+)?)\s*(?:jt|juta)/i;
  const matchJt = text.match(jtRegex);
  if (matchJt) {
    salary = `${matchJt[1]}-${matchJt[2]}jt`;
  } else {
    const singleJt = /(?:gaji|salary|idr|rp\.?)?\s*(\d{1,3})\s*(?:jt|juta)/i;
    const matchSingle = text.match(singleJt);
    if (matchSingle) {
      salary = `~${matchSingle[1]}jt`;
    } else {
      const fullRp = /rp\.?\s*(\d{1,3}(?:\.\d{3})+)/i;
      const matchRp = text.match(fullRp);
      if (matchRp) {
        salary = matchRp[0];
      }
    }
  }

  // Scan line by line for Title, Company, Location
  for (const line of lines) {
    // Title / Posisi Matcher
    if (!title) {
      const titlePrefixMatch = line.match(/^(?:posisi|role|jabatan|lowongan|looking for|dibutuhkan|we are hiring|hiring)\s*[:=-]\s*(.*)$/i);
      if (titlePrefixMatch && titlePrefixMatch[1]) {
        title = titlePrefixMatch[1].trim();
        continue;
      }
    }

    // Company Matcher
    if (!company) {
      // Check for "PT ..." or "CV ..." first (highest accuracy)
      const ptMatch = line.match(/\b(PT\.?|CV\.?)\s+[A-Za-z0-9\s.,&-]+/i);
      if (ptMatch) {
        company = ptMatch[0].trim().replace(/[.,]$/, '');
        continue;
      }

      const companyPrefixMatch = line.match(/^(?:perusahaan|company|kantor|at|di)\s*[:=-]\s*(.*)$/i);
      if (companyPrefixMatch && companyPrefixMatch[1]) {
        company = companyPrefixMatch[1].trim();
        continue;
      }

      // Check for "[HIRING] Company" or "HIRING: Company"
      const hiringMatch = line.match(/^\[?(?:hiring|loker|lowongan|we are hiring)\]?\s*[:=-]?\s*([A-Za-z0-9\s.,&-]+)$/i);
      if (
        hiringMatch &&
        hiringMatch[1] &&
        !hiringMatch[1].toLowerCase().includes('posisi') &&
        !hiringMatch[1].toLowerCase().includes('role')
      ) {
        const cleaned = hiringMatch[1].replace(/^(?:kerja|loker)\s+/i, '').trim();
        if (cleaned) {
          company = cleaned;
          continue;
        }
      }
    }

    // Location Matcher
    if (!location) {
      const locPrefixMatch = line.match(/^(?:lokasi|location|penempatan|placement)\s*[:=-]\s*(.*)$/i);
      if (locPrefixMatch && locPrefixMatch[1]) {
        location = locPrefixMatch[1].trim();
        continue;
      }
    }
  }

  // If location still empty, scan for city names
  if (!location) {
    for (const city of INDONESIAN_CITIES) {
      if (lowerFull.includes(city.toLowerCase())) {
        location = city;
        break;
      }
    }
  }

  // Fallback for Title and Company if not explicitly labeled
  if (!title || !company) {
    for (const line of lines) {
      // Check pattern: "Senior React Developer at Gojek" or "Frontend Dev - Traveloka"
      if (!title && !company) {
        if (line.includes(' at ')) {
          const parts = line.split(/\s+at\s+/i);
          if (parts[0] && parts[1]) {
            title = parts[0].replace(/^(?:hiring|we are hiring|open position:?)\s*/i, '').trim();
            company = parts[1].trim();
            continue;
          }
        }
        if (line.includes(' - ') && !line.includes('http')) {
          const parts = line.split(' - ');
          if (parts.length === 2 && parts[0].length < 40 && parts[1].length < 40) {
            title = parts[0].trim();
            company = parts[1].trim();
            continue;
          }
        }
      }

      // Check if line contains job title keywords (e.g. Developer, Engineer, Manager, Designer)
      if (!title) {
        const lowerCurrentLine = line.toLowerCase();
        const roleKeywords = [
          'developer', 'engineer', 'designer', 'manager', 'lead', 'specialist',
          'consultant', 'analyst', 'officer', 'staff', 'admin', 'intern', 'architect'
        ];
        if (roleKeywords.some((kw) => lowerCurrentLine.includes(kw)) && line.length < 50) {
          title = line.replace(/^[-*•#\s]+/, '').replace(/^(?:posisi|role):?\s*/i, '').trim();
          continue;
        }
      }
    }
  }

  // Extract requirements or notes highlights
  const requirementLines = lines.filter((l) => {
    const lower = l.toLowerCase();
    return (
      l.startsWith('-') ||
      l.startsWith('•') ||
      l.startsWith('*') ||
      lower.includes('syarat') ||
      lower.includes('kualifikasi') ||
      lower.includes('requirement') ||
      lower.includes('deskripsi')
    );
  });

  if (requirementLines.length > 0) {
    notesLines.push(...requirementLines.slice(0, 5));
  } else if (lines.length > 0) {
    notesLines.push(lines.slice(0, 3).join('\n'));
  }

  // Fallback company from applyUrl domain if still empty
  if (!company && applyUrl) {
    try {
      const u = new URL(applyUrl);
      const hostParts = u.hostname.replace(/^www\./, '').split('.');
      if (hostParts.length >= 2) {
        const brand = hostParts[0] === 'careers' || hostParts[0] === 'jobs' ? hostParts[1] : hostParts[0];
        if (!['linkedin', 'glints', 'jobstreet', 'kalibrr', 'dealls', 'kitalulus', 'indeed'].includes(brand.toLowerCase())) {
          company = brand.charAt(0).toUpperCase() + brand.slice(1);
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    title: title || 'Posisi / Role Lowongan',
    company: company || 'Nama Perusahaan',
    location: location || (workType === 'Remote' ? 'Remote (Indonesia)' : 'Jakarta'),
    workType,
    salary: salary || '15-25jt',
    sourceTag,
    applyUrl,
    notes: notesLines.join('\n').slice(0, 400),
  };
}
