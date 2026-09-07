import React from 'react';
import { JobApplication } from '../../types/job';

interface AnalyticsViewProps {
  jobs: JobApplication[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ jobs }) => {
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
