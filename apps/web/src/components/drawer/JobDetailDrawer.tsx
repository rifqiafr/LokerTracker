import React, { useState, useEffect } from 'react';
import { JobApplication, Stage } from '../../types/job';

interface JobDetailDrawerProps {
  job: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: JobApplication) => void;
  onDelete: (jobId: string) => void;
  onMoveStage: (jobId: string, targetStage: Stage) => void;
}

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onMoveStage,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [showStageSelector, setShowStageSelector] = useState(false);

  useEffect(() => {
    if (job?.notes) {
      setNotesText(job.notes.join('\n'));
    } else {
      setNotesText('');
    }
  }, [job]);

  if (!job) return null;

  const handleSaveNotes = () => {
    const updatedNotes = notesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    onSave({
      ...job,
      notes: updatedNotes,
    });
  };

  const getStageColor = (st: Stage) => {
    switch (st) {
      case 'applied':
        return 'text-secondary bg-secondary';
      case 'test':
        return 'text-primary bg-primary';
      case 'interview':
        return 'text-secondary-container bg-secondary-container';
      case 'offered':
        return 'text-tertiary-fixed-dim bg-tertiary-fixed-dim';
      case 'rejected':
        return 'text-error bg-error';
    }
  };

  return (
    <div
      className={`fixed top-14 right-0 bottom-0 bg-surface-container-lowest shadow-2xl z-40 transition-all duration-300 flex flex-col border-l border-surface-container/60 ${
        isFullscreen ? 'w-full md:w-[760px]' : 'w-full sm:w-[500px]'
      } ${isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
      id="detail-drawer"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-3.5 sm:px-spacing-lg py-2.5 sm:py-spacing-md bg-surface-container-low/50 border-b border-surface-container/40">
        <div className="flex items-center gap-spacing-xs">
          <span className={`w-3 h-3 rounded-full ${getStageColor(job.stage).split(' ')[1]}`} />
          <span className={`font-label-md text-xs sm:text-label-md uppercase tracking-wider font-semibold ${getStageColor(job.stage).split(' ')[0]}`}>
            {job.stage} Stage
          </span>
        </div>
        <div className="flex items-center gap-spacing-2xs">
          <button
            type="button"
            className="p-1.5 text-outline hover:text-on-surface rounded-md hover:bg-surface-container transition-colors cursor-pointer hidden sm:flex"
            title={isFullscreen ? 'Kecilkan' : 'Buka Fullscreen'}
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <span className="material-symbols-outlined text-base">
              {isFullscreen ? 'close_fullscreen' : 'open_in_full'}
            </span>
          </button>
          <button
            type="button"
            className="p-1.5 text-outline hover:text-on-surface rounded-md hover:bg-surface-container transition-colors cursor-pointer"
            onClick={onClose}
            title="Tutup"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </div>

      {/* Drawer Content Scroll */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-spacing-lg flex flex-col gap-spacing-lg custom-scrollbar">
        {/* Primary Title & Meta Banner */}
        <div className="flex flex-col gap-spacing-xs">
          <div className="flex items-center gap-spacing-sm">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-headline-lg text-headline-lg font-bold shadow-sm ${job.logoColorClass}`}
            >
              {job.logoLetter}
            </div>
            <div className="flex flex-col">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold">
                {job.title}
              </h1>
              <span className="font-body-md text-body-md text-on-surface-variant">
                {job.company} • {job.location || 'Engineering Team'}
              </span>
            </div>
          </div>
        </div>

        {/* Registration URL / Portal Karir Link */}
        {job.applyUrl && (
          <a
            href={job.applyUrl.startsWith('http') ? job.applyUrl : `https://${job.applyUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-secondary-fixed/50 hover:bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary/30 transition-all group shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary shadow-xs flex-shrink-0">
                <span className="material-symbols-outlined text-lg">link</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
                  Portal / URL Pendaftaran
                </span>
                <span className="text-xs text-secondary truncate font-medium underline">
                  {job.applyUrl}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-base text-secondary group-hover:translate-x-0.5 transition-transform flex-shrink-0">
              open_in_new
            </span>
          </a>
        )}

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-2 gap-spacing-xs bg-surface-container-low p-spacing-sm rounded-xl border border-surface-container/50">
          <div className="flex flex-col gap-0.5">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Gaji Ditawarkan
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Rp {job.salary}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Sistem Kerja
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              {job.workType} {job.workType === 'Hybrid' && '(3d Office)'}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 pt-2">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Tanggal Apply
            </span>
            <span className="font-body-md text-body-md text-on-surface">
              {job.appliedDate || '24 Agustus 2026'}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 pt-2">
            <span className="font-label-sm text-label-sm text-outline uppercase">
              Jadwal Terdekat
            </span>
            <span className="font-body-md text-body-md text-secondary-container font-semibold">
              {job.schedule || 'Belum dijadwalkan'}
            </span>
          </div>
        </div>

        {/* Notion-style Notes Editor */}
        <div className="flex flex-col gap-spacing-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Catatan Teknis & Interview
            </h4>
            <span className="font-label-sm text-label-sm text-outline">Markdown Didukung</span>
          </div>

          <div className="p-spacing-sm bg-surface-container-low/60 rounded-lg flex flex-col gap-spacing-xs font-body-sm text-body-sm text-on-surface leading-relaxed border border-surface-container/40">
            <textarea
              className="w-full bg-transparent resize-y min-h-[110px] focus:outline-none font-body-sm text-body-sm text-on-surface"
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Tuliskan catatan interview, teknikal, kisi-kisi atau pertanyaan di sini..."
            />
          </div>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-3 sm:p-spacing-md bg-surface-container-low/70 flex items-center justify-between border-t border-surface-container/60 relative flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (confirm(`Yakin ingin menghapus lamaran ${job.title} di ${job.company}?`)) {
              onDelete(job.id);
            }
          }}
          className="px-2.5 sm:px-spacing-sm py-1.5 rounded-lg text-error hover:bg-error-container/40 font-label-md text-xs sm:text-label-md flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm sm:text-base">delete</span>
          <span>Hapus</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-spacing-xs relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStageSelector(!showStageSelector)}
              className="px-2.5 sm:px-spacing-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs sm:text-label-md transition-colors cursor-pointer"
            >
              Pindah Kolom
            </button>

            {showStageSelector && (
              <div className="absolute bottom-11 right-0 w-44 bg-surface-container-lowest border border-surface-container shadow-xl rounded-lg py-1 z-50">
                {(['applied', 'test', 'interview', 'offered', 'rejected'] as Stage[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        onMoveStage(job.id, st);
                        setShowStageSelector(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-on-surface hover:bg-surface-container transition-colors capitalize flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      {st}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveNotes}
            className="px-3 sm:px-spacing-md py-1.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-container font-label-md text-xs sm:text-label-md font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
