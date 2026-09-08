import React, { useState } from 'react';
import { JobApplication, Stage } from '../../types/job';
import { CompanyLogo } from '../common/CompanyLogo';

interface JobCardProps {
  job: JobApplication;
  onSelect: (job: JobApplication) => void;
  onMoveStage?: (jobId: string, newStage: Stage) => void;
  onArchive?: (jobId: string) => void;
  onDragStartCard?: (e: React.DragEvent, jobId: string) => void;
  onDragEndCard?: (e: React.DragEvent) => void;
  isSelected?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onSelect,
  onMoveStage,
  onArchive,
  onDragStartCard,
  onDragEndCard,
  isSelected = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', job.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    onDragStartCard?.(e, job.id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    onDragEndCard?.(e);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(job)}
      className={`group relative flex flex-col gap-1.5 p-2 bg-surface-container-lowest rounded-lg shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing border select-none ${isSelected ? 'border-secondary ring-2 ring-secondary/20' : 'border-surface-container/30'
        } ${isDragging ? 'opacity-40 scale-[0.98] ring-2 ring-secondary/40 rotate-1 shadow-lg' : ''}`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <CompanyLogo
            company={job.company}
            logoLetter={job.logoLetter}
            logoColorClass={job.logoColorClass}
            companyLogo={job.companyLogo}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-headline-sm text-xs font-semibold text-on-surface group-hover:text-secondary transition-colors truncate">
              {job.title}
            </h3>
            <span className="font-body-sm text-[11px] text-on-surface-variant truncate block">
              {job.company}
            </span>
          </div>
        </div>

        <div className="relative flex-shrink-0">
          <button
            type="button"
            aria-label="Opsi lainnya"
            onClick={handleMenuClick}
            className="text-outline opacity-0 group-hover:opacity-100 hover:text-on-surface transition-opacity p-0.5 rounded hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-sm">more_vert</span>
          </button>

          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-6 w-40 bg-surface-container-lowest shadow-xl rounded-lg border border-surface-container py-1 z-30 animate-in fade-in"
            >
              <div className="px-3 py-1 text-[10px] font-semibold text-outline uppercase tracking-wider">
                Pindah Status
              </div>
              {([
                'applied',
                'test',
                'interview',
                'offered',
                'rejected',
              ] as Stage[]).map((targetStage) =>
                targetStage !== job.stage && (
                  <button
                    key={targetStage}
                    type="button"
                    onClick={() => {
                      onMoveStage?.(job.id, targetStage);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-1 text-[11px] text-on-surface hover:bg-surface-container transition-colors capitalize flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    {targetStage}
                  </button>
                )
              )}
              {onArchive && (
                <div className="border-t border-surface-container mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onArchive(job.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-1 text-[11px] text-outline hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-xs">archive</span>
                    Arsipkan Lamaran
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Meta Pills (WorkType, Location, Salary) */}
      <div className="flex flex-wrap items-center gap-1 pt-0.5">
        {job.workType === 'Remote' && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-secondary-fixed/50 text-on-secondary-fixed-variant rounded text-[10px] font-medium">
            <span className="material-symbols-outlined text-[11px]">home</span>Remote
          </span>
        )}
        {job.workType === 'Hybrid' && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-surface-container text-on-surface rounded text-[10px] font-medium">
            <span className="material-symbols-outlined text-[11px]">sync_alt</span>Hybrid
          </span>
        )}
        {job.workType === 'On-site' && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-surface-container-highest text-on-surface-variant rounded text-[10px] font-medium truncate max-w-[90px]">
            <span className="material-symbols-outlined text-[11px]">location_on</span>
            <span className="truncate">{job.location ? job.location : 'On-site'}</span>
          </span>
        )}

        {job.location && job.workType !== 'On-site' && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-surface-container-highest text-on-surface rounded text-[10px] truncate max-w-[80px]">
            📍 {job.location}
          </span>
        )}

        {job.salary && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-surface-container-high text-on-surface font-numeric-table text-[10px] rounded font-medium">
            💰 {job.salary}
          </span>
        )}

        {job.applyUrl && (
          <a
            href={job.applyUrl.startsWith('http') ? job.applyUrl : `https://${job.applyUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={`Buka URL Pendaftaran: ${job.applyUrl}`}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-secondary-fixed/50 hover:bg-secondary-fixed text-on-secondary-fixed-variant rounded text-[10px] font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[10px]">link</span>
            <span>Link</span>
          </a>
        )}
      </div>

      {/* Stage-Specific Highlights & Footers */}
      {job.stage === 'test' && (
        <div className="flex items-center justify-between pt-0.5">
          {job.schedule ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary-fixed/40 text-primary rounded text-[10px]">
              <span className="material-symbols-outlined text-xs text-primary">
                timer
              </span>
              <span className="font-semibold truncate max-w-[95px]">{job.schedule}</span>
            </div>
          ) : (
            <span />
          )}

          {job.sourceTag ? (
            <span className="text-[10px] font-medium text-secondary truncate max-w-[90px]">
              {job.sourceTag}
            </span>
          ) : job.matchScore ? (
            <span className="text-[10px] text-secondary bg-secondary-fixed/20 px-1 py-0.2 rounded font-medium">
              Match {job.matchScore}%
            </span>
          ) : null}
        </div>
      )}

      {job.stage === 'applied' && (
        <div className="flex items-center justify-between pt-0.5 text-[11px] text-outline">
          <span className="flex items-center gap-0.5 text-[10px]">
            <span className="material-symbols-outlined text-[11px]">send</span>
            {job.appliedDate || 'Baru diajukan'}
          </span>
          {job.sourceTag && (
            <span
              className={`text-[10px] px-1 py-0.2 rounded font-medium ${job.sourceTag === 'Via Web'
                  ? 'text-secondary-container bg-secondary-fixed/30'
                  : 'text-outline'
                }`}
            >
              {job.sourceTag}
            </span>
          )}
        </div>
      )}

      {job.stage === 'interview' && (
        <div className="flex items-center justify-between pt-0.5">
          {job.schedule ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-surface-container-high text-on-surface rounded text-[10px]">
              <span className="material-symbols-outlined text-xs text-secondary-container">
                calendar_month
              </span>
              <span className="font-semibold truncate max-w-[90px]">{job.schedule}</span>
            </div>
          ) : (
            <span />
          )}
          {job.scheduleType && (
            <span
              className={`text-[10px] font-medium ${job.scheduleType === 'User Tech' ? 'text-secondary' : 'text-outline'
                }`}
            >
              {job.scheduleType}
            </span>
          )}
        </div>
      )}

      {job.stage === 'offered' && (
        <>
          {job.offerStatus && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-tertiary-fixed/30 rounded">
              <span className="material-symbols-outlined text-sm text-on-tertiary-container">
                verified
              </span>
              <span className="text-[10px] font-bold text-on-tertiary-container">
                {job.offerStatus}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-outline text-[10px]">
              {job.responseDeadline ? `Batas: ${job.responseDeadline}` : 'Segera'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.(job.id);
              }}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-[10px] font-medium transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-xs">archive</span>
              <span>Arsip</span>
            </button>
          </div>
        </>
      )}

      {job.stage === 'rejected' && (
        <>
          <div className="flex items-center justify-between pt-1">
            <span className="text-outline text-[10px] truncate max-w-[90px]">
              {job.rejectionReason || 'Tidak lanjut'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.(job.id);
              }}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-[10px] font-medium transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-xs">archive</span>
              <span>Arsip</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
