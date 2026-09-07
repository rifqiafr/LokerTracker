export type Stage = 'applied' | 'test' | 'interview' | 'offered' | 'rejected';

export type WorkType = 'Remote' | 'Hybrid' | 'On-site';

export interface TimelineMilestone {
  id: string;
  title: string;
  subtitle: string;
  completed: boolean;
  current?: boolean;
  link?: string;
}

export interface JobAttachment {
  name: string;
  size: string;
  uploadDate: string;
}

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  logoLetter: string;
  logoColorClass: string;
  stage: Stage;
  workType: WorkType;
  location?: string;
  salary: string;
  salaryMin?: number; // in millions IDR, e.g. 15
  salaryMax?: number; // in millions IDR, e.g. 25
  appliedDate?: string;
  updatedAt?: string;
  sourceTag?: string;
  matchScore?: number;
  schedule?: string;
  scheduleType?: string;
  offerStatus?: string;
  responseDeadline?: string;
  rejectionReason?: string;
  rejectionDate?: string;
  isArchived?: boolean;
  timeline?: TimelineMilestone[];
  attachment?: JobAttachment;
  notes?: string[];
  applyUrl?: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
}

export interface ColumnDefinition {
  id: Stage;
  title: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
}
