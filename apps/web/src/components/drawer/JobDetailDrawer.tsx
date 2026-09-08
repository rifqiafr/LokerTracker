import React, { useState, useEffect } from 'react';
import { JobApplication, Stage, WorkType } from '../../types/job';
import { CompanyLogo } from '../common/CompanyLogo';
import { resolveCompanyLogo } from '../../utils/companyLogo';

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
  const [isEditing, setIsEditing] = useState(false);
  const [showStageSelector, setShowStageSelector] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [stage, setStage] = useState<Stage>('applied');
  const [workType, setWorkType] = useState<WorkType>('Remote');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [schedule, setSchedule] = useState('');
  const [applyUrl, setApplyUrl] = useState('');
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    if (job) {
      setTitle(job.title || '');
      setCompany(job.company || '');
      setCompanyLogo(job.companyLogo || '');
      setStage(job.stage || 'applied');
      setWorkType(job.workType || 'Remote');
      setLocation(job.location || '');
      setSalary(job.salary || '');
      setSchedule(job.schedule || '');
      setApplyUrl(job.applyUrl || '');
      setNotesText(job.notes ? job.notes.join('\n') : '');
      setIsEditing(false);
      setShowStageSelector(false);
    }
  }, [job]);

  if (!job) return null;

  const handleCancelEdit = () => {
    if (job) {
      setTitle(job.title || '');
      setCompany(job.company || '');
      setCompanyLogo(job.companyLogo || '');
      setStage(job.stage || 'applied');
      setWorkType(job.workType || 'Remote');
      setLocation(job.location || '');
      setSalary(job.salary || '');
      setSchedule(job.schedule || '');
      setApplyUrl(job.applyUrl || '');
      setNotesText(job.notes ? job.notes.join('\n') : '');
    }
    setIsEditing(false);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WebP, SVG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const dataUrl = readerEvent.target?.result as string;
      setCompanyLogo(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = () => {
    if (!title.trim() || !company.trim()) {
      alert('Posisi dan Perusahaan wajib diisi.');
      return;
    }

    const updatedNotes = notesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const finalLogo = resolveCompanyLogo(company, companyLogo);

    const initials = company
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const updatedJob: JobApplication = {
      ...job,
      title: title.trim(),
      company: company.trim(),
      logoLetter: initials || job.logoLetter,
      companyLogo: finalLogo,
      stage,
      workType,
      location: location.trim() || undefined,
      salary: salary.trim() || job.salary || '15-25jt',
      schedule: schedule.trim() || undefined,
      applyUrl: applyUrl.trim() || undefined,
      notes: updatedNotes,
    };

    onSave(updatedJob);
    if (stage !== job.stage) {
      onMoveStage(job.id, stage);
    }
    setIsEditing(false);
  };

  const handleQuickSaveNotes = () => {
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
        isFullscreen ? 'w-full md:w-[760px]' : 'w-full sm:w-[520px]'
      } ${isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
      id="detail-drawer"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-3.5 sm:px-spacing-lg py-2.5 sm:py-spacing-md bg-surface-container-low/60 border-b border-surface-container/40">
        <div className="flex items-center gap-spacing-xs">
          <span className={`w-3 h-3 rounded-full ${getStageColor(isEditing ? stage : job.stage).split(' ')[1]}`} />
          <span className={`font-label-md text-xs sm:text-label-md uppercase tracking-wider font-semibold ${getStageColor(isEditing ? stage : job.stage).split(' ')[0]}`}>
            {isEditing ? stage : job.stage} Stage
          </span>
          {isEditing && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold uppercase tracking-wider animate-pulse">
              Mode Edit
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-spacing-2xs">
          {/* Edit Mode Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                handleCancelEdit();
              } else {
                setIsEditing(true);
              }
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              isEditing
                ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-surface-container'
                : 'bg-secondary/15 text-secondary hover:bg-secondary hover:text-on-secondary border border-secondary/30 shadow-2xs'
            }`}
            title={isEditing ? 'Batal Edit' : 'Edit Detail Lowongan'}
          >
            <span className="material-symbols-outlined text-sm">
              {isEditing ? 'close' : 'edit'}
            </span>
            <span>{isEditing ? 'Batal' : 'Edit Lowongan'}</span>
          </button>

          {/* Fullscreen Toggle */}
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

          {/* Close Button */}
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
        {/* ==================================================== */}
        {/* ================= MODE EDIT AKTIF ================= */}
        {/* ==================================================== */}
        {isEditing ? (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Alert banner */}
            <div className="p-3 rounded-xl bg-secondary-fixed/30 border border-secondary/20 flex items-center justify-between gap-2 text-xs text-on-secondary-fixed-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">edit_note</span>
                <span>Anda sedang mengedit detail lowongan kerja ini.</span>
              </div>
            </div>

            {/* Role / Title & Company Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                  Posisi / Role *
                </label>
                <input
                  required
                  className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container"
                  placeholder="Contoh: Frontend Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                  Perusahaan *
                </label>
                <input
                  required
                  className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container"
                  placeholder="Contoh: Gojek, Traveloka"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>

            {/* Logo / Company Profile Photo Editor */}
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container-low/60 border border-surface-container/50">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm text-outline uppercase font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                  <span>Foto Profil / Logo Perusahaan</span>
                </label>
                {companyLogo && (
                  <button
                    type="button"
                    onClick={() => setCompanyLogo('')}
                    className="text-[11px] text-secondary hover:underline cursor-pointer"
                  >
                    Reset ke Otomatis
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <CompanyLogo
                  company={company}
                  logoLetter={company ? company.charAt(0).toUpperCase() : 'LK'}
                  logoColorClass={job.logoColorClass}
                  companyLogo={companyLogo}
                  size="lg"
                />
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <input
                    className="w-full px-2.5 py-1.5 bg-surface-container-lowest rounded-md text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container/60 text-xs"
                    placeholder="URL logo atau domain website (opsional)"
                    value={companyLogo}
                    onChange={(e) => setCompanyLogo(e.target.value)}
                  />
                  <div className="flex items-center justify-between text-[11px] text-outline">
                    <span>Otomatis mendeteksi logo dari nama</span>
                    <label className="text-secondary hover:underline cursor-pointer flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">upload</span>
                      <span>Unggah Gambar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoFileUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage & WorkType Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                  Tahapan Kolom
                </label>
                <select
                  className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container capitalize"
                  value={stage}
                  onChange={(e) => setStage(e.target.value as Stage)}
                >
                  <option value="applied">Applied</option>
                  <option value="test">Test</option>
                  <option value="interview">Interview</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                  Sistem Kerja
                </label>
                <select
                  className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container"
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value as WorkType)}
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>

            {/* Location & Salary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                  Lokasi Penempatan
                </label>
                <input
                  className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container"
                  placeholder="Contoh: Jakarta / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                  Estimasi Gaji
                </label>
                <input
                  className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container"
                  placeholder="Contoh: 15-25jt"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
            </div>

            {/* Schedule & Apply URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                  Jadwal Terdekat
                </label>
                <input
                  className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container"
                  placeholder="Contoh: 10 Sep 14:00 WIB"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                  URL Portal / Link Lowongan
                </label>
                <input
                  className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container"
                  placeholder="https://career.company.com/job/..."
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Notes Section in Edit Mode */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                Catatan Teknis & Interview
              </label>
              <textarea
                rows={4}
                className="w-full p-3 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container resize-y"
                placeholder="Tuliskan catatan teknis, link interview, atau persiapan di sini..."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
              />
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* ================= MODE VIEW BIASA ================== */
          /* ==================================================== */
          <>
            {/* Primary Title & Meta Banner */}
            <div className="flex flex-col gap-spacing-xs">
              <div className="flex items-center gap-spacing-sm">
                <CompanyLogo
                  company={job.company}
                  logoLetter={job.logoLetter}
                  logoColorClass={job.logoColorClass}
                  companyLogo={job.companyLogo}
                  size="lg"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold truncate">
                    {job.title}
                  </h1>
                  <span className="font-body-md text-body-md text-on-surface-variant truncate">
                    {job.company} • {job.location || 'Lokasi Fleksibel'}
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
                  {job.salary ? `Rp ${job.salary}` : 'Belum tertera'}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-sm text-label-sm text-outline uppercase">
                  Sistem Kerja
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  {job.workType || 'Remote'}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 pt-2">
                <span className="font-label-sm text-label-sm text-outline uppercase">
                  Tanggal Apply
                </span>
                <span className="font-body-md text-body-md text-on-surface">
                  {job.appliedDate || 'Hari ini'}
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
          </>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-3 sm:p-spacing-md bg-surface-container-low/80 flex items-center justify-between border-t border-surface-container/60 relative flex-wrap gap-2">
        {isEditing ? (
          /* Footer saat Mode Edit */
          <>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs sm:text-label-md transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-1.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-container font-label-md text-xs sm:text-label-md font-semibold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">check</span>
              <span>Simpan Perubahan</span>
            </button>
          </>
        ) : (
          /* Footer saat Mode View */
          <>
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
              {/* Pindah Kolom Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStageSelector(!showStageSelector)}
                  className="px-2.5 sm:px-spacing-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs sm:text-label-md transition-colors cursor-pointer"
                >
                  Pindah Kolom
                </button>

                {showStageSelector && (
                  <div className="absolute bottom-11 right-0 w-44 bg-surface-container-lowest border border-surface-container shadow-xl rounded-lg py-1 z-50 animate-in fade-in">
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

              {/* Edit Button in Footer */}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-2.5 sm:px-spacing-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs sm:text-label-md transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">edit</span>
                <span>Edit</span>
              </button>

              {/* Simpan Catatan */}
              <button
                type="button"
                onClick={handleQuickSaveNotes}
                className="px-3 sm:px-spacing-md py-1.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-container font-label-md text-xs sm:text-label-md font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
