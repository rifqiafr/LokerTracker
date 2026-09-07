import React from 'react';
import { ColumnDefinition, JobApplication, Stage } from '../../types/job';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  columns: ColumnDefinition[];
  jobs: JobApplication[];
  selectedJobId?: string;
  onSelectJob: (job: JobApplication) => void;
  onAddJobToStage: (stage: Stage) => void;
  onMoveStage: (jobId: string, newStage: Stage) => void;
  onArchiveJob: (jobId: string) => void;
  onDropJob?: (jobId: string, targetStage: Stage) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  jobs,
  selectedJobId,
  onSelectJob,
  onAddJobToStage,
  onMoveStage,
  onArchiveJob,
  onDropJob,
}) => {
  return (
    <div className="w-full h-full min-h-0 flex lg:grid lg:grid-cols-5 gap-2.5 sm:gap-spacing-xs items-stretch overflow-x-auto lg:overflow-hidden snap-x snap-mandatory pb-1 custom-scrollbar">
      {columns.map((col) => {
        const columnJobs = jobs.filter((j) => j.stage === col.id && !j.isArchived);

        return (
          <div
            key={col.id}
            className="w-[85vw] sm:w-[320px] lg:w-auto flex-shrink-0 snap-center h-full flex flex-col min-w-0"
          >
            <KanbanColumn
              column={col}
              jobs={columnJobs}
              selectedJobId={selectedJobId}
              onSelectJob={onSelectJob}
              onAddJobToStage={onAddJobToStage}
              onMoveStage={onMoveStage}
              onArchiveJob={onArchiveJob}
              onDropJob={onDropJob || onMoveStage}
            />
          </div>
        );
      })}
    </div>
  );
};
