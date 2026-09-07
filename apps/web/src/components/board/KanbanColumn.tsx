import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ColumnDefinition, JobApplication, Stage } from '../../types/job';
import { JobCard } from './JobCard';

interface KanbanColumnProps {
  column: ColumnDefinition;
  jobs: JobApplication[];
  selectedJobId?: string;
  onSelectJob: (job: JobApplication) => void;
  onAddJobToStage: (stage: Stage) => void;
  onMoveStage: (jobId: string, newStage: Stage) => void;
  onArchiveJob: (jobId: string) => void;
  onDropJob?: (jobId: string, targetStage: Stage) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  jobs,
  selectedJobId,
  onSelectJob,
  onAddJobToStage,
  onMoveStage,
  onArchiveJob,
  onDropJob,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setCanScrollUp(scrollTop > 5);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [jobs, checkScroll]);

  const handleScrollDownClick = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 140, behavior: 'smooth' });
    }
  };

  const handleScrollUpClick = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: -140, behavior: 'smooth' });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const jobId = e.dataTransfer.getData('text/plain');
    if (jobId) {
      onDropJob?.(jobId, column.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full min-w-0 h-full flex flex-col bg-surface-container-low/70 p-spacing-xs rounded-xl relative border transition-all duration-150 overflow-hidden ${
        isDragOver
          ? 'border-secondary ring-2 ring-secondary/30 bg-secondary-fixed/15'
          : 'border-surface-container-low'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-spacing-xs py-1 flex-shrink-0 mb-1 z-20 bg-surface-container-low/90">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${column.dotColor}`} />
          <h2 className="font-headline-sm text-sm font-semibold text-on-surface tracking-tight truncate">
            {column.title}
          </h2>
          <span
            className={`px-1.5 py-0.2 ${column.badgeBg} ${column.badgeText} font-numeric-table text-xs rounded-full font-bold flex-shrink-0`}
          >
            {jobs.length}
          </span>
        </div>
        <button
          type="button"
          aria-label={`Tambah ke ${column.title}`}
          onClick={() => onAddJobToStage(column.id)}
          className="text-outline hover:text-on-surface p-1 rounded-md hover:bg-surface-container transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined text-base">add</span>
        </button>
      </div>

      {/* Top Gradient Fade & Scroll Indicator */}
      {canScrollUp && (
        <div
          onClick={handleScrollUpClick}
          className="absolute top-[38px] left-0 right-0 h-7 pointer-events-auto cursor-pointer bg-gradient-to-b from-surface-container-low via-surface-container-low/80 to-transparent z-10 flex items-start justify-center pt-0.5 transition-opacity duration-200 group"
          title="Scroll ke atas"
        >
          <div className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-surface-container-highest/80 text-on-surface-variant group-hover:bg-secondary group-hover:text-on-secondary text-[9px] font-medium shadow-xs transition-all">
            <span className="material-symbols-outlined text-xs">keyboard_arrow_up</span>
            <span>Atas</span>
          </div>
        </div>
      )}

      {/* Cards List Container - scrollable internally without scrollbars */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-spacing-xs pr-0.5"
      >
        {/* Dynamic Drop Zone when dragging over this column */}
        {isDragOver && (
          <div className="w-full py-2.5 px-2 rounded-lg border-2 border-dashed border-secondary bg-secondary-fixed/40 flex items-center justify-center gap-1.5 text-xs font-semibold text-secondary animate-pulse flex-shrink-0">
            <span className="material-symbols-outlined text-sm">arrow_downward</span>
            <span>Lepas di sini ({column.title})</span>
          </div>
        )}

        {/* Regular cards */}
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onSelect={onSelectJob}
            onMoveStage={onMoveStage}
            onArchive={onArchiveJob}
            isSelected={selectedJobId === job.id}
          />
        ))}

        {jobs.length === 0 && !isDragOver && (
          <div className="py-6 flex flex-col items-center justify-center text-outline text-xs border-2 border-dashed border-surface-container rounded-lg">
            <span>Belum ada lamaran</span>
          </div>
        )}
      </div>

      {/* Bottom Gradient Fade & Scroll Indicator */}
      {canScrollDown && (
        <div
          onClick={handleScrollDownClick}
          className="absolute bottom-0 left-0 right-0 h-9 pointer-events-auto cursor-pointer bg-gradient-to-t from-surface-container-low via-surface-container-low/90 to-transparent z-10 flex items-end justify-center pb-1 transition-opacity duration-200 group"
          title="Scroll ke bawah untuk melihat lamaran lainnya"
        >
          <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-surface-container-highest/90 text-on-surface-variant group-hover:bg-secondary group-hover:text-on-secondary text-[10px] font-semibold shadow-xs transition-all border border-surface-container">
            <span>Lainnya</span>
            <span className="material-symbols-outlined text-xs animate-bounce">
              keyboard_arrow_down
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
