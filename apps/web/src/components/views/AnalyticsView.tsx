import React, { useMemo, useState } from 'react';
import { JobApplication, Stage } from '../../types/job';
import { CompanyLogo } from '../common/CompanyLogo';

interface AnalyticsViewProps {
  jobs: JobApplication[];
}

const getJobMonthInfo = (job: JobApplication) => {
  let date: Date | null = null;
  if (job.createdAt) {
    const d = new Date(job.createdAt);
    if (!isNaN(d.getTime())) date = d;
  }
  if (!date && job.appliedDate) {
    const parsed = Date.parse(job.appliedDate);
    if (!isNaN(parsed)) {
      date = new Date(parsed);
    } else {
      const months: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, may: 4, jun: 5,
        jul: 6, agu: 7, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, des: 11, dec: 11,
      };
      const parts = job.appliedDate.trim().split(/\s+/);
      if (parts.length >= 2) {
        const day = parseInt(parts[0], 10);
        const mStr = parts[1].toLowerCase().slice(0, 3);
        const year = parts[2] ? parseInt(parts[2], 10) : new Date().getFullYear();
        if (!isNaN(day) && months[mStr] !== undefined) {
          date = new Date(year, months[mStr], day);
        }
      }
    }
  }
  if (!date) {
    date = new Date();
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const key = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const label = `${monthNames[month]} ${year}`;
  return { key, label, year, month };
};

const STAGE_BADGE_STYLE: Record<Stage, { label: string; bg: string; text: string }> = {
  applied: { label: 'Applied', bg: 'bg-surface-container text-on-surface-variant', text: 'text-on-surface-variant' },
  test: { label: 'Test', bg: 'bg-primary-fixed/50 text-primary', text: 'text-primary' },
  interview: { label: 'Interview', bg: 'bg-secondary-fixed/50 text-on-secondary-fixed-variant', text: 'text-secondary' },
  offered: { label: 'Offered', bg: 'bg-tertiary-fixed/50 text-on-tertiary-container', text: 'text-on-tertiary-container' },
  rejected: { label: 'Rejected', bg: 'bg-error-container/40 text-error', text: 'text-error' },
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ jobs }) => {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const total = jobs.length;
  const stageCounts = {
    applied: jobs.filter((j) => j.stage === 'applied').length,
    test: jobs.filter((j) => j.stage === 'test').length,
    interview: jobs.filter((j) => j.stage === 'interview').length,
    offered: jobs.filter((j) => j.stage === 'offered').length,
    rejected: jobs.filter((j) => j.stage === 'rejected').length,
  };

  const remoteCount = jobs.filter((j) => j.workType === 'Remote').length;
  const hybridCount = jobs.filter((j) => j.workType === 'Hybrid').length;
  const onsiteCount = jobs.filter((j) => j.workType === 'On-site').length;

  const interviewRate = total ? Math.round(((stageCounts.interview + stageCounts.offered) / (stageCounts.applied || 1)) * 100) : 0;
  const offerRate = total ? Math.round((stageCounts.offered / total) * 100) : 0;

  // Monthly statistics
  const monthlyStats = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        label: string;
        year: number;
        month: number;
        total: number;
        applied: number;
        test: number;
        interview: number;
        offered: number;
        rejected: number;
        jobs: JobApplication[];
      }
    >();

    jobs.forEach((job) => {
      const { key, label, year, month } = getJobMonthInfo(job);
      if (!map.has(key)) {
        map.set(key, {
          key,
          label,
          year,
          month,
          total: 0,
          applied: 0,
          test: 0,
          interview: 0,
          offered: 0,
          rejected: 0,
          jobs: [],
        });
      }
      const stat = map.get(key)!;
      stat.total += 1;
      if (stat[job.stage] !== undefined) {
        stat[job.stage] += 1;
      }
      stat.jobs.push(job);
    });

    return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [jobs]);

  const maxMonthlyTotal = useMemo(() => {
    return monthlyStats.reduce((max, cur) => Math.max(max, cur.total), 1);
  }, [monthlyStats]);

  const mostActiveMonth = useMemo(() => {
    if (monthlyStats.length === 0) return null;
    return [...monthlyStats].sort((a, b) => b.total - a.total)[0];
  }, [monthlyStats]);

  const avgPerMonth = monthlyStats.length > 0 ? (total / monthlyStats.length).toFixed(1) : '0';

  const toggleExpandMonth = (key: string) => {
    setExpandedMonth((prev) => (prev === key ? null : key));
  };

  return (
    <div className="flex flex-col gap-spacing-lg pb-spacing-3xl">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Analytics & Insights
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Ringkasan performa dan konversi pencarian kerja Anda periode ini
          </p>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-spacing-md">
        <div className="bg-surface-container-lowest p-spacing-md rounded-xl shadow-sm border border-surface-container/50">
          <span className="font-label-sm text-label-sm text-outline uppercase">Total Lamaran</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline-xl text-headline-xl font-bold text-on-surface">{total}</span>
            <span className="text-xs text-secondary font-semibold">Aktif</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-spacing-md rounded-xl shadow-sm border border-surface-container/50">
          <span className="font-label-sm text-label-sm text-outline uppercase">Interview Stage</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline-xl text-headline-xl font-bold text-secondary-container">
              {stageCounts.interview}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">Kandidat</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-spacing-md rounded-xl shadow-sm border border-surface-container/50">
          <span className="font-label-sm text-label-sm text-outline uppercase">Penawaran (Offer)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline-xl text-headline-xl font-bold text-on-tertiary-container">
              {stageCounts.offered}
            </span>
            <span className="text-xs text-on-tertiary-container font-semibold">🎉 {offerRate}% Rate</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-spacing-md rounded-xl shadow-sm border border-surface-container/50">
          <span className="font-label-sm text-label-sm text-outline uppercase">Interview Success Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline-xl text-headline-xl font-bold text-primary">{interviewRate}%</span>
            <span className="text-xs text-secondary font-semibold">Tinggi</span>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Section */}
      <div className="bg-surface-container-lowest p-spacing-lg rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-spacing-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-surface-container/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">calendar_month</span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Daftar Lamaran Per Bulan
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Tren jumlah lamaran yang diajukan setiap bulan beserta status perkembangannya
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low rounded-lg text-xs">
              <span className="text-outline">Rata-rata:</span>
              <strong className="text-on-surface font-semibold">{avgPerMonth}</strong>
              <span className="text-outline text-[11px]">/bln</span>
            </div>
            {mostActiveMonth && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary-fixed/40 rounded-lg text-xs">
                <span className="material-symbols-outlined text-secondary text-sm">local_fire_department</span>
                <span className="text-on-secondary-fixed-variant font-medium">
                  Terbanyak: <strong>{mostActiveMonth.label} ({mostActiveMonth.total})</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {monthlyStats.length === 0 ? (
          <div className="py-8 text-center text-outline text-xs border border-dashed border-surface-container rounded-xl">
            Belum ada data lamaran yang tercatat per bulan.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {monthlyStats.map((stat) => {
              const isExpanded = expandedMonth === stat.key;
              const relativePercent = Math.round((stat.total / maxMonthlyTotal) * 100);
              const overallPercent = total > 0 ? Math.round((stat.total / total) * 100) : 0;
              const responseRate = stat.total > 0 ? Math.round(((stat.interview + stat.offered) / stat.total) * 100) : 0;

              return (
                <div
                  key={stat.key}
                  className="bg-surface-container-low/50 hover:bg-surface-container-low transition-all rounded-xl border border-surface-container/60 overflow-hidden"
                >
                  {/* Month Header Row */}
                  <div
                    onClick={() => toggleExpandMonth(stat.key)}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    {/* Left: Month Name & Total */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-10 h-10 rounded-xl bg-secondary-fixed/40 text-secondary flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-lg">event_note</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-on-surface">
                            {stat.label}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-bold font-numeric-table">
                            {stat.total} Lamaran
                          </span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant">
                          {overallPercent}% dari seluruh lamaran ({responseRate}% respons)
                        </span>
                      </div>
                    </div>

                    {/* Middle: Relative Volume Progress Bar */}
                    <div className="flex-1 max-w-xs hidden md:flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] text-outline font-medium">
                        <span>Volume Lamaran</span>
                        <span>{stat.total} posisi</span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden flex">
                        {/* Segmented status breakdown bar */}
                        {stat.applied > 0 && (
                          <div
                            style={{ width: `${(stat.applied / stat.total) * relativePercent}%` }}
                            className="bg-outline/70 h-full"
                            title={`Applied: ${stat.applied}`}
                          />
                        )}
                        {stat.test > 0 && (
                          <div
                            style={{ width: `${(stat.test / stat.total) * relativePercent}%` }}
                            className="bg-primary-container h-full"
                            title={`Test: ${stat.test}`}
                          />
                        )}
                        {stat.interview > 0 && (
                          <div
                            style={{ width: `${(stat.interview / stat.total) * relativePercent}%` }}
                            className="bg-secondary-container h-full"
                            title={`Interview: ${stat.interview}`}
                          />
                        )}
                        {stat.offered > 0 && (
                          <div
                            style={{ width: `${(stat.offered / stat.total) * relativePercent}%` }}
                            className="bg-tertiary-fixed-dim h-full"
                            title={`Offered: ${stat.offered}`}
                          />
                        )}
                        {stat.rejected > 0 && (
                          <div
                            style={{ width: `${(stat.rejected / stat.total) * relativePercent}%` }}
                            className="bg-error/60 h-full"
                            title={`Rejected: ${stat.rejected}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Right: Stage Badges & Toggle */}
                    <div className="flex items-center gap-2 sm:justify-end flex-wrap">
                      <div className="flex items-center gap-1 text-[11px] font-medium flex-wrap">
                        {stat.applied > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                            Applied: {stat.applied}
                          </span>
                        )}
                        {stat.test > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-primary-fixed/40 text-primary">
                            Test: {stat.test}
                          </span>
                        )}
                        {stat.interview > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-secondary-fixed/40 text-on-secondary-fixed-variant">
                            Interview: {stat.interview}
                          </span>
                        )}
                        {stat.offered > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed/40 text-on-tertiary-container font-semibold">
                            Offer: {stat.offered}
                          </span>
                        )}
                        {stat.rejected > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-error-container/40 text-error">
                            Reject: {stat.rejected}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        aria-label="Lihat daftar lamaran bulan ini"
                        className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container transition-colors ml-1"
                      >
                        <span className="material-symbols-outlined text-lg transition-transform duration-200">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Expandable Job List for this Month */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-surface-container/60 animate-in fade-in duration-150">
                      <div className="text-[11px] font-semibold text-outline uppercase tracking-wider mb-2">
                        Daftar Pekerjaan yang Dilamar ({stat.jobs.length})
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {stat.jobs.map((job) => {
                          const badge = STAGE_BADGE_STYLE[job.stage] || STAGE_BADGE_STYLE.applied;
                          return (
                            <div
                              key={job.id}
                              className="p-2.5 bg-surface-container-lowest rounded-lg border border-surface-container/60 shadow-xs flex items-center justify-between gap-2 hover:border-secondary/40 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <CompanyLogo
                                  company={job.company}
                                  logoLetter={job.logoLetter}
                                  logoColorClass={job.logoColorClass}
                                  companyLogo={job.companyLogo}
                                  size="sm"
                                />
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-xs font-semibold text-on-surface truncate">
                                    {job.title}
                                  </h5>
                                  <span className="text-[11px] text-on-surface-variant truncate block">
                                    {job.company}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${badge.bg}`}
                                >
                                  {badge.label}
                                </span>
                                {job.workType && (
                                  <span className="text-[10px] text-outline">
                                    {job.workType}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conversion Funnel & Work System Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-spacing-md">
        {/* Funnel */}
        <div className="bg-surface-container-lowest p-spacing-lg rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-spacing-md">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Funnel Konversi Lamaran
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-on-surface mb-1">
                <span>Applied</span>
                <span>{stageCounts.applied}</span>
              </div>
              <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all"
                  style={{ width: `${(stageCounts.applied / (total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-on-surface mb-1">
                <span>Technical Test</span>
                <span>{stageCounts.test}</span>
              </div>
              <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-container rounded-full transition-all"
                  style={{ width: `${(stageCounts.test / (total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-on-surface mb-1">
                <span>Interview</span>
                <span>{stageCounts.interview}</span>
              </div>
              <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary-container rounded-full transition-all"
                  style={{ width: `${(stageCounts.interview / (total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-on-surface mb-1">
                <span>Offered</span>
                <span>{stageCounts.offered}</span>
              </div>
              <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-tertiary-fixed-dim rounded-full transition-all"
                  style={{ width: `${(stageCounts.offered / (total || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Work Model */}
        <div className="bg-surface-container-lowest p-spacing-lg rounded-xl shadow-sm border border-surface-container/50 flex flex-col gap-spacing-md">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Preferensi Sistem Kerja
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-secondary-fixed/30 rounded-xl text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-secondary text-2xl mb-1">home</span>
              <span className="font-headline-md text-headline-md font-bold text-secondary">{remoteCount}</span>
              <span className="text-xs text-on-surface font-medium">Remote</span>
            </div>
            <div className="p-3 bg-surface-container rounded-xl text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-on-surface-variant text-2xl mb-1">sync_alt</span>
              <span className="font-headline-md text-headline-md font-bold text-on-surface">{hybridCount}</span>
              <span className="text-xs text-on-surface font-medium">Hybrid</span>
            </div>
            <div className="p-3 bg-surface-container-high rounded-xl text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-on-surface text-2xl mb-1">location_on</span>
              <span className="font-headline-md text-headline-md font-bold text-on-surface">{onsiteCount}</span>
              <span className="text-xs text-on-surface font-medium">On-site</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
