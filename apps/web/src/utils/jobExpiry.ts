import { JobApplication } from '../types/job';

export type JobExpiryState = 'active' | 'expiring_soon' | 'expired' | 'closed';

export interface JobExpiryInfo {
  state: JobExpiryState;
  isClosedOrExpired: boolean;
  isClosed: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
  label: string;
  sublabel?: string;
  badgeClass: string;
  icon: string;
  daysRemaining?: number;
  formattedDeadline?: string;
}

/**
 * Normalizes a date string or timestamp to start of day in local time.
 */
function toStartOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Evaluates the closed/expired status of a job application.
 */
export function getJobExpiryStatus(job: Partial<JobApplication>): JobExpiryInfo {
  const now = new Date();
  const todayStart = toStartOfDay(now);

  // 1. Check if manually closed
  if (job.isClosed) {
    return {
      state: 'closed',
      isClosedOrExpired: true,
      isClosed: true,
      isExpired: false,
      isExpiringSoon: false,
      label: 'Ditutup',
      sublabel: 'Penerimaan telah ditutup',
      badgeClass: 'bg-error-container/80 text-on-error-container border border-error/30',
      icon: 'cancel',
    };
  }

  // 2. Check deadline if specified
  if (job.deadline) {
    const deadlineDate = new Date(job.deadline);
    if (!isNaN(deadlineDate.getTime())) {
      const deadlineStart = toStartOfDay(deadlineDate);
      const diffTime = deadlineStart - todayStart;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      const formattedDeadline = deadlineDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: deadlineDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });

      // Deadline has passed
      if (diffDays < 0) {
        const daysAgo = Math.abs(diffDays);
        return {
          state: 'expired',
          isClosedOrExpired: true,
          isClosed: false,
          isExpired: true,
          isExpiringSoon: false,
          label: 'Expired',
          sublabel: `Lewat ${daysAgo === 0 ? 'hari ini' : `${daysAgo} hari yang lalu`}`,
          badgeClass: 'bg-error/15 text-error border border-error/30 dark:bg-error/20 dark:text-error',
          icon: 'timer_off',
          daysRemaining: diffDays,
          formattedDeadline,
        };
      }

      // Expiring soon: within 3 days (0 = today, 1 = tomorrow, etc.)
      if (diffDays <= 3) {
        const label = diffDays === 0 ? 'Hari Terakhir!' : `Sisa ${diffDays} hari`;
        return {
          state: 'expiring_soon',
          isClosedOrExpired: false,
          isClosed: false,
          isExpired: false,
          isExpiringSoon: true,
          label,
          sublabel: `Batas: ${formattedDeadline}`,
          badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40 font-semibold animate-pulse',
          icon: 'schedule',
          daysRemaining: diffDays,
          formattedDeadline,
        };
      }

      // Active with future deadline
      return {
        state: 'active',
        isClosedOrExpired: false,
        isClosed: false,
        isExpired: false,
        isExpiringSoon: false,
        label: `Batas ${formattedDeadline}`,
        badgeClass: 'bg-surface-container-high text-on-surface-variant border border-surface-container/60',
        icon: 'event',
        daysRemaining: diffDays,
        formattedDeadline,
      };
    }
  }

  // 3. Active without deadline
  return {
    state: 'active',
    isClosedOrExpired: false,
    isClosed: false,
    isExpired: false,
    isExpiringSoon: false,
    label: 'Aktif',
    badgeClass: 'bg-surface-container text-on-surface-variant',
    icon: 'check_circle',
  };
}
