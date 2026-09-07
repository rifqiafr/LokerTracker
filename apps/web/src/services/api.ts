import { JobApplication, Stage } from '../types/job';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('loker_token');
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('loker_token', token);
  }
};

export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('loker_token');
    localStorage.removeItem('loker_user');
    localStorage.removeItem('loker_cached_jobs');
  }
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({ success: false, message: 'Invalid response' }));

  if (!response.ok) {
    throw new Error(json.message || `Request failed with status ${response.status}`);
  }

  return json;
}

// Convert Backend Job to Frontend JobApplication
export const mapBackendJobToFrontend = (job: any): JobApplication => {
  const logoColors = [
    'bg-surface-container-high text-secondary',
    'bg-primary-container text-on-primary-container',
    'bg-surface-variant text-secondary',
    'bg-tertiary-container text-on-tertiary-container',
  ];
  const charCode = (job.company || 'L').charCodeAt(0) % logoColors.length;

  return {
    id: job.id,
    title: job.role,
    company: job.company,
    location: job.location,
    salary: job.salary || undefined,
    stage: (job.status as Stage) || 'applied',
    logoLetter: (job.company || 'J').charAt(0).toUpperCase(),
    logoColorClass: logoColors[charCode],
    workType: (job.location && job.location.toLowerCase().includes('remote'))
      ? 'Remote'
      : (job.location && job.location.toLowerCase().includes('hybrid'))
      ? 'Hybrid'
      : 'On-site',
    appliedDate: new Date(job.dateApplied || job.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    }),
    notes: job.notes ? [job.notes] : [],
    applyUrl: job.notes && job.notes.includes('Link: ')
      ? job.notes.split('\n').find((l: string) => l.startsWith('Link: '))?.replace('Link: ', '').trim()
      : undefined,
    tags: Array.isArray(job.tags) ? job.tags : [],
    priority: job.priority,
    isArchived: Boolean(job.isArchived),
  };
};

export const authApi = {
  async register(name: string, email: string, password: string) {
    const res = await apiFetch<{
      success: boolean;
      data: { user: { id: string; name: string; email: string }; token: string };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setAuthToken(res.data.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('loker_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await apiFetch<{
      success: boolean;
      data: { user: { id: string; name: string; email: string }; token: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.data.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('loker_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async oauthLogin(provider: 'google' | 'github', payload: { email: string; name: string; avatarUrl?: string }) {
    const res = await apiFetch<{
      success: boolean;
      data: { user: { id: string; name: string; email: string; avatarUrl?: string }; token: string };
    }>('/auth/oauth', {
      method: 'POST',
      body: JSON.stringify({ provider, ...payload }),
    });
    setAuthToken(res.data.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('loker_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe() {
    const res = await apiFetch<{
      success: boolean;
      data: { user: { id: string; name: string; email: string; avatarUrl?: string } };
    }>('/auth/me');
    return res.data.user;
  },

  async updateProfile(payload: { name?: string; avatarUrl?: string }) {
    const res = await apiFetch<{
      success: boolean;
      message: string;
      data: { user: { id: string; name: string; email: string; avatarUrl?: string } };
    }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('loker_user', JSON.stringify(res.data.user));
    }
    return res.data.user;
  },

  logout() {
    clearAuthToken();
  },
};

export const jobsApi = {
  async getJobs() {
    const res = await apiFetch<{
      success: boolean;
      data: { jobs: any[] };
    }>('/jobs');
    return res.data.jobs.map(mapBackendJobToFrontend);
  },

  async createJob(payload: {
    company: string;
    role: string;
    location?: string;
    salary?: string;
    status: Stage;
    priority?: 'high' | 'medium' | 'low';
    notes?: string;
    tags?: string[];
  }) {
    const res = await apiFetch<{
      success: boolean;
      data: { job: any };
    }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendJobToFrontend(res.data.job);
  },

  async updateJobStatus(id: string, status: Stage, orderIndex?: number) {
    const res = await apiFetch<{
      success: boolean;
      data: { job: any };
    }> (`/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, orderIndex }),
    });
    return mapBackendJobToFrontend(res.data.job);
  },

  async updateJob(id: string, payload: Partial<JobApplication>) {
    const res = await apiFetch<{
      success: boolean;
      data: { job: any };
    }>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        company: payload.company,
        role: payload.title,
        location: payload.location,
        salary: payload.salary,
        status: payload.stage,
        priority: payload.priority,
        notes: payload.notes?.join('\n'),
        tags: payload.tags,
      }),
    });
    return mapBackendJobToFrontend(res.data.job);
  },

  async archiveJob(id: string, isArchived: boolean) {
    const res = await apiFetch<{
      success: boolean;
      data: { job: any };
    }>(`/jobs/${id}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ isArchived }),
    });
    return mapBackendJobToFrontend(res.data.job);
  },

  async deleteJob(id: string) {
    return await apiFetch<{ success: boolean; message: string }>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  async extractFromUrl(url: string) {
    const res = await apiFetch<{
      success: boolean;
      data: {
        title: string;
        company: string;
        location: string;
        workType: 'Remote' | 'Hybrid' | 'On-site';
        salary?: string;
        sourceTag: string;
        applyUrl: string;
        notes: string;
      };
    }>('/jobs/extract-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    return res.data;
  },
};

export const analyticsApi = {
  async getMetrics() {
    return await apiFetch<{
      success: boolean;
      data: {
        total: number;
        active: number;
        stages: Record<string, number>;
        rates: { interviewRate: number; offerRate: number };
      };
    }>('/analytics/metrics');
  },
};
