/**
 * Utility for resolving company logos and profile images.
 * Provides curated logo mapping for popular Indonesian and global tech companies,
 * as well as dynamic Google Favicon CDN resolution for web domains.
 */

const KNOWN_COMPANY_DOMAINS: Record<string, string> = {
  // Indonesian Tech & Startups
  gojek: 'gojek.com',
  'gojek indonesia': 'gojek.com',
  goto: 'gotocompany.com',
  'goto group': 'gotocompany.com',
  tokopedia: 'tokopedia.com',
  bukalapak: 'bukalapak.com',
  traveloka: 'traveloka.com',
  shopee: 'shopee.co.id',
  'shopee id': 'shopee.co.id',
  'shopee indonesia': 'shopee.co.id',
  grab: 'grab.com',
  'grab holdings': 'grab.com',
  'grab indonesia': 'grab.com',
  ovo: 'ovo.id',
  'ovo (boc)': 'ovo.id',
  dana: 'dana.id',
  'dana indonesia': 'dana.id',
  blibli: 'blibli.com',
  'blibli.com': 'blibli.com',
  tiket: 'tiket.com',
  'tiket.com': 'tiket.com',
  'kopi kenangan': 'kopikenangan.com',
  ruangguru: 'ruangguru.com',
  halodoc: 'halodoc.com',
  alodokter: 'alodokter.com',
  kitalulus: 'kitalulus.com',
  dealls: 'dealls.com',
  kalibrr: 'kalibrr.com',
  glints: 'glints.com',
  jobstreet: 'jobstreet.co.id',
  bibit: 'bibit.id',
  stockbit: 'stockbit.com',
  pluang: 'pluang.com',
  ajaib: 'ajaib.co.id',
  flip: 'flip.id',
  xendit: 'xendit.co',
  midtrans: 'midtrans.com',
  sirclo: 'sirclo.com',
  lummo: 'lummo.com',
  akulaku: 'akulaku.com',
  kredivo: 'kredivo.id',
  bobobox: 'bobobox.com',
  fore: 'fore.coffee',
  'fore coffee': 'fore.coffee',

  // Telecommunications & Banking (Indonesia)
  telkom: 'telkom.co.id',
  telkomsel: 'telkomsel.com',
  indosat: 'ioh.co.id',
  xl: 'xl.co.id',
  'xl axiata': 'xl.co.id',
  smartfren: 'smartfren.com',
  bca: 'bca.co.id',
  'bank bca': 'bca.co.id',
  mandiri: 'bankmandiri.co.id',
  'bank mandiri': 'bankmandiri.co.id',
  bri: 'bri.co.id',
  'bank bri': 'bri.co.id',
  bni: 'bni.co.id',
  'bank bni': 'bni.co.id',
  cimb: 'cimbniaga.co.id',
  'cimb niaga': 'cimbniaga.co.id',
  jago: 'jago.com',
  'bank jago': 'jago.com',
  jenius: 'jenius.com',
  'btpn / jenius': 'jenius.com',
  seabank: 'seabank.co.id',
  astra: 'astra.co.id',

  // Global Tech Companies
  google: 'google.com',
  microsoft: 'microsoft.com',
  apple: 'apple.com',
  amazon: 'amazon.com',
  meta: 'meta.com',
  facebook: 'meta.com',
  netflix: 'netflix.com',
  spotify: 'spotify.com',
  twitter: 'x.com',
  x: 'x.com',
  linkedin: 'linkedin.com',
  github: 'github.com',
  gitlab: 'gitlab.com',
  slack: 'slack.com',
  discord: 'discord.com',
  adobe: 'adobe.com',
  salesforce: 'salesforce.com',
  oracle: 'oracle.com',
  ibm: 'ibm.com',
  stripe: 'stripe.com',
  airbnb: 'airbnb.com',
  uber: 'uber.com',
  bytedance: 'bytedance.com',
  tiktok: 'tiktok.com',
};

/**
 * Generate high-res favicon URL from domain name
 */
export function getDomainFaviconUrl(domain: string, size: number = 128): string {
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanDomain)}&sz=${size}`;
}

/**
 * Resolve logo image URL based on company name or custom URL
 */
export function resolveCompanyLogo(company: string, explicitLogoUrl?: string): string | undefined {
  if (explicitLogoUrl && explicitLogoUrl.trim()) {
    return explicitLogoUrl.trim();
  }

  if (!company || !company.trim()) {
    return undefined;
  }

  const normalized = company.toLowerCase().trim();

  // 1. Direct match in dictionary
  if (KNOWN_COMPANY_DOMAINS[normalized]) {
    return getDomainFaviconUrl(KNOWN_COMPANY_DOMAINS[normalized]);
  }

  // 2. Partial match in dictionary keys
  for (const [key, domain] of Object.entries(KNOWN_COMPANY_DOMAINS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return getDomainFaviconUrl(domain);
    }
  }

  // 3. If input looks like a domain (e.g. 'company.co.id' or 'mybrand.com' or 'startup.io')
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(normalized)) {
    return getDomainFaviconUrl(normalized);
  }

  return undefined;
}
