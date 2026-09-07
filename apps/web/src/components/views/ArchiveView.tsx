import React from 'react';
import { JobApplication } from '../../types/job';

interface ArchiveViewProps {
  archivedJobs: JobApplication[];
  onRestore: (jobId: string) => void;
  onDelete: (jobId: string) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  archivedJobs,
  onRestore,
  onDelete,
}) => {
  return (
    <div className="flex flex-col gap-spacing-lg pb-spacing-3xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
          Arsip Lamaran
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Daftar lamaran yang telah selesai, ditutup, atau diarsipkan
        </p>
      </div>

      {archivedJobs.length === 0 ? (
        <div className="bg-surface-container-lowest p-spacing-3xl rounded-2xl border border-surface-container text-center flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-4xl text-outline">archive</span>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Belum ada lamaran yang diarsipkan
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Gunakan tombol "Arsipkan" pada kartu lamaran di kolom Offered atau Rejected.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-spacing-md">
          {archivedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-surface-container-lowest p-spacing-md rounded-xl shadow-sm border border-surface-container flex flex-col justify-between gap-spacing-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-label-md ${job.logoColorClass}`}
                  >
                    {job.logoLetter}
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                      {job.title}
                    </h4>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {job.company}
                    </span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full capitalize bg-surface-container-high text-on-surface-variant font-medium">
                  {job.stage}
                </span>
              </div>

              <div className="text-xs text-outline flex items-center justify-between border-t border-surface-container pt-2">
                <span>{job.salary || 'Gaji tidak dicantumkan'}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onRestore(job.id)}
                    className="text-secondary hover:underline font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">unarchive</span>
                    Pulihkan
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(job.id)}
                    className="text-error hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
