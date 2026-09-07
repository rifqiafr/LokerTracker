import React, { useState } from 'react';
import { JobApplication, Stage, WorkType } from '../../types/job';
import { jobsApi } from '../../services/api';
import { parseJobText } from '../../utils/textJobParser';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddJob: (newJob: Partial<JobApplication>) => void;
  defaultStage?: Stage;
}

type InputMode = 'auto' | 'manual';
type AutoSubMode = 'url' | 'text';

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onAddJob,
  defaultStage = 'applied',
}) => {
  // Modal navigation mode
  const [inputMode, setInputMode] = useState<InputMode>('auto');
  const [autoSubMode, setAutoSubMode] = useState<AutoSubMode>('url');

  // Auto inputs
  const [urlInput, setUrlInput] = useState('');
  const [rawTextInput, setRawTextInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedPreview, setExtractedPreview] = useState<any | null>(null);

  // Form inputs
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [stage, setStage] = useState<Stage>(defaultStage);
  const [workType, setWorkType] = useState<WorkType>('Remote');
  const [location, setLocation] = useState('Jakarta');
  const [salary, setSalary] = useState('18-25jt');
  const [sourceTag, setSourceTag] = useState('LinkedIn');
  const [applyUrl, setApplyUrl] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Helper to commit job to board
  const commitJob = (jobData: {
    title: string;
    company: string;
    stage: Stage;
    workType: WorkType;
    location: string;
    salary?: string;
    sourceTag: string;
    applyUrl?: string;
    notes?: string;
  }) => {
    const initials = jobData.company
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const colorStyles = [
      'bg-surface-container-high text-secondary',
      'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      'bg-secondary-fixed text-on-secondary-fixed',
      'bg-error/10 text-error',
      'bg-primary-fixed text-primary',
    ];
    const randomColor = colorStyles[Math.floor(Math.random() * colorStyles.length)];

    onAddJob({
      title: jobData.title.trim(),
      company: jobData.company.trim(),
      stage: jobData.stage,
      workType: jobData.workType,
      location: jobData.location.trim(),
      salary: jobData.salary?.trim() || undefined,
      sourceTag: jobData.sourceTag.trim(),
      applyUrl: jobData.applyUrl?.trim() || undefined,
      logoLetter: initials || 'LK',
      logoColorClass: randomColor,
      appliedDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      notes: jobData.notes ? jobData.notes.split('\n').filter(Boolean) : ['Lamaran baru ditambahkan.'],
      timeline: [
        {
          id: `t-${Date.now()}`,
          title: 'Draf Lamaran Dibuat',
          subtitle: `Dibuat pada ${new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
          })}`,
          completed: true,
        },
      ],
    });

    handleResetAndClose();
  };

  const handleResetAndClose = () => {
    setTitle('');
    setCompany('');
    setApplyUrl('');
    setNotes('');
    setUrlInput('');
    setRawTextInput('');
    setExtractedPreview(null);
    setExtractError(null);
    setInputMode('auto');
    onClose();
  };

  // Handle URL Extraction
  const handleExtractUrl = async () => {
    if (!urlInput.trim()) return;
    setIsExtracting(true);
    setExtractError(null);
    setExtractedPreview(null);

    try {
      let extracted: any;
      try {
        extracted = await jobsApi.extractFromUrl(urlInput.trim());
      } catch (backendErr) {
        // Fallback: client-side parser
        extracted = parseJobText(urlInput.trim());
      }

      if (extracted) {
        setTitle(extracted.title || '');
        setCompany(extracted.company || '');
        setLocation(extracted.location || 'Jakarta');
        setWorkType(extracted.workType || 'Remote');
        if (extracted.salary) setSalary(extracted.salary);
        setSourceTag(extracted.sourceTag || 'Web Karir');
        setApplyUrl(extracted.applyUrl || urlInput.trim());
        if (extracted.notes) setNotes(extracted.notes);

        setExtractedPreview({
          ...extracted,
          applyUrl: extracted.applyUrl || urlInput.trim(),
        });
      }
    } catch (err: any) {
      setExtractError(err?.message || 'Gagal mengekstrak data dari link. Coba gunakan Magic Paste teks.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle Text Extraction (Magic Paste)
  const handleExtractText = () => {
    if (!rawTextInput.trim()) return;
    setIsExtracting(true);
    setExtractError(null);
    setExtractedPreview(null);

    try {
      const extracted = parseJobText(rawTextInput);

      setTitle(extracted.title);
      setCompany(extracted.company);
      setLocation(extracted.location);
      setWorkType(extracted.workType);
      setSalary(extracted.salary);
      setSourceTag(extracted.sourceTag);
      setApplyUrl(extracted.applyUrl);
      setNotes(extracted.notes);

      setExtractedPreview(extracted);
    } catch (err: any) {
      setExtractError('Gagal memproses format teks. Pastikan teks berisi informasi posisi atau perusahaan.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Quick direct save from extracted preview
  const handleDirectSaveFromPreview = () => {
    if (!title.trim() || !company.trim()) {
      setInputMode('manual');
      return;
    }
    commitJob({
      title,
      company,
      stage,
      workType,
      location,
      salary,
      sourceTag,
      applyUrl,
      notes,
    });
  };

  // Manual Form Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;
    commitJob({
      title,
      company,
      stage,
      workType,
      location,
      salary,
      sourceTag,
      applyUrl,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in select-none">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-container flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-3.5 sm:px-spacing-lg py-3 bg-surface-container-low/50 border-b border-surface-container/40 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
            <h3 className="font-headline-sm text-sm sm:text-headline-sm font-bold text-on-surface">
              Tambah Lamaran Pekerjaan
            </h3>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1 text-outline hover:text-on-surface rounded-md hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Tab Navigation: Mode Otomatis vs Formulir Manual */}
        <div className="flex border-b border-surface-container/50 bg-surface-container-low/20 px-2 sm:px-spacing-lg pt-2 gap-1 sm:gap-2 flex-shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setInputMode('auto')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-label-md font-label-md font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              inputMode === 'auto'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">bolt</span>
            <span>⚡ Mode Otomatis</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('manual')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-label-md font-label-md font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              inputMode === 'manual'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            <span>✏️ Formulir Lengkap</span>
            {title && company && (
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" title="Form telah terisi" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-spacing-lg overflow-y-auto flex-1 flex flex-col gap-spacing-md">
          {/* ================= MODE OTOMATIS ================= */}
          {inputMode === 'auto' && (
            <div className="flex flex-col gap-spacing-md">
              {/* Sub-tabs: Link URL vs Magic Paste */}
              <div className="flex p-1 bg-surface-container-low rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAutoSubMode('url');
                    setExtractError(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-label-sm text-label-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    autoSubMode === 'url'
                      ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">link</span>
                  <span>Tarik dari Link Lowongan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAutoSubMode('text');
                    setExtractError(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-label-sm text-label-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    autoSubMode === 'text'
                      ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">content_paste</span>
                  <span>Magic Paste (Teks Pesan)</span>
                </button>
              </div>

              {/* URL Extractor Form */}
              {autoSubMode === 'url' && (
                <div className="flex flex-col gap-2.5">
                  <label className="font-label-sm text-label-sm text-outline uppercase flex items-center justify-between">
                    <span>Tempel Link Lowongan</span>
                    <span className="text-[11px] text-on-surface-variant font-normal normal-case">
                      Mendukung LinkedIn, Glints, JobStreet, Kalibrr, dll.
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-outline text-base pointer-events-none">
                        link
                      </span>
                      <input
                        type="url"
                        className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-transparent placeholder:text-outline"
                        placeholder="https://www.linkedin.com/jobs/view/..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleExtractUrl();
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isExtracting || !urlInput.trim()}
                      onClick={handleExtractUrl}
                      className="px-3 py-2 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold hover:bg-secondary-container transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer flex-shrink-0 shadow-xs"
                    >
                      {isExtracting ? (
                        <>
                          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                          <span>Menarik Data...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">bolt</span>
                          <span>Ekstrak</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-outline">
                    💡 Sistem otomatis mengekstrak Posisi, Nama Perusahaan, Lokasi, dan Link Pendaftaran dari halaman lowongan.
                  </p>
                </div>
              )}

              {/* Text Extractor Form (Magic Paste) */}
              {autoSubMode === 'text' && (
                <div className="flex flex-col gap-2.5">
                  <label className="font-label-sm text-label-sm text-outline uppercase flex items-center justify-between">
                    <span>Tempel Teks Lowongan (WhatsApp / Telegram / Feed)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setRawTextInput(
                          `Lowongan Kerja PT GoTo Gojek Tokopedia\nPosisi: Senior Frontend Developer (React/TS)\nLokasi: Jakarta Selatan (Hybrid)\nGaji: 18 - 25 jt / bulan\nLink: https://careers.goto.com/job/1234\nSyarat: Pengalaman 3 tahun, mahir Tailwind & React.`
                        );
                      }}
                      className="text-[11px] text-secondary hover:underline normal-case font-normal cursor-pointer"
                    >
                      Gunakan contoh teks
                    </button>
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-transparent placeholder:text-outline resize-none"
                    placeholder="Contoh:&#10;Info loker: PT Maju Bersama lagi buka posisi Backend Engineer (Go/Node) untuk penempatan Bandung (Remote). Range gaji 15-20jt. Apply ke https://karir.majubersama.com"
                    value={rawTextInput}
                    onChange={(e) => setRawTextInput(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isExtracting || !rawTextInput.trim()}
                      onClick={handleExtractText}
                      className="px-3 py-2 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold hover:bg-secondary-container transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                      <span>Ekstrak Teks Otomatis</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {extractError && (
                <div className="p-3 rounded-xl bg-error-container/30 border border-error/30 text-error flex items-start gap-2 text-body-sm">
                  <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
                  <div className="flex-1">
                    <p className="font-semibold text-label-sm">Perhatian</p>
                    <p className="text-xs">{extractError}</p>
                  </div>
                </div>
              )}

              {/* Extracted Preview Result Card */}
              {extractedPreview && (
                <div className="p-spacing-md rounded-xl bg-surface-container-low/70 border border-secondary/30 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-secondary font-semibold text-label-sm">
                      <span className="material-symbols-outlined text-base text-tertiary-fixed-dim">
                        check_circle
                      </span>
                      <span>Informasi Berhasil Dikenali!</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                      {sourceTag}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-surface-container-lowest/80 border border-surface-container/50">
                      <span className="text-outline block text-[10px] uppercase font-bold">Posisi</span>
                      <span className="font-semibold text-on-surface line-clamp-1">{title}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest/80 border border-surface-container/50">
                      <span className="text-outline block text-[10px] uppercase font-bold">Perusahaan</span>
                      <span className="font-semibold text-on-surface line-clamp-1">{company}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest/80 border border-surface-container/50">
                      <span className="text-outline block text-[10px] uppercase font-bold">Sistem & Lokasi</span>
                      <span className="font-medium text-on-surface line-clamp-1">
                        {workType} • {location}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest/80 border border-surface-container/50">
                      <span className="text-outline block text-[10px] uppercase font-bold">Estimasi Gaji</span>
                      <span className="font-medium text-on-surface line-clamp-1">{salary || 'Belum tertera'}</span>
                    </div>
                  </div>

                  {applyUrl && (
                    <div className="text-[11px] text-outline truncate flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">link</span>
                      <span className="truncate">{applyUrl}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-surface-container/50">
                    <button
                      type="button"
                      onClick={() => setInputMode('manual')}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>Edit di Formulir</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDirectSaveFromPreview}
                      className="px-3.5 py-1.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-container font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-sm">rocket_launch</span>
                      <span>Langsung Simpan</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= MODE FORMULIR LENGKAP ================= */}
          {inputMode === 'manual' && (
            <form id="add-job-manual-form" onSubmit={handleManualSubmit} className="flex flex-col gap-spacing-md">
              {extractedPreview && (
                <div className="p-2.5 rounded-lg bg-surface-container-low border border-secondary/20 flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-sm">info</span>
                  <span>Formulir telah diisi otomatis dari hasil ekstraksi. Sesuaikan data jika diperlukan.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-spacing-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-outline uppercase">
                    Posisi / Role *
                  </label>
                  <input
                    required
                    className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-transparent"
                    placeholder="Contoh: Frontend Developer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-outline uppercase">
                    Perusahaan *
                  </label>
                  <input
                    required
                    className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-transparent"
                    placeholder="Contoh: Gojek, Traveloka"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-spacing-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-outline uppercase">Kolom Status</label>
                  <select
                    className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary capitalize"
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
                  <label className="font-label-sm text-label-sm text-outline uppercase">Sistem Kerja</label>
                  <select
                    className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value as WorkType)}
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline uppercase">Lokasi Penempatan</label>
                <input
                  className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                  placeholder="Contoh: Jakarta / Bandung / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-spacing-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-outline uppercase">Estimasi Gaji</label>
                  <input
                    className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                    placeholder="15-25jt"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-outline uppercase">Platform / Sumber</label>
                  <input
                    className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                    placeholder="LinkedIn / Referral / Web"
                    value={sourceTag}
                    onChange={(e) => setSourceTag(e.target.value)}
                  />
                </div>
              </div>

              {/* URL Pendaftaran */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline uppercase flex items-center justify-between">
                  <span>URL / Link Pendaftaran</span>
                  <span className="text-[10px] text-on-surface-variant lowercase">opsional</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-outline text-base pointer-events-none">
                    link
                  </span>
                  <input
                    type="url"
                    className="w-full pl-8 pr-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-transparent"
                    placeholder="https://careers.company.com/job/..."
                    value={applyUrl}
                    onChange={(e) => setApplyUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-outline uppercase">
                  Catatan Singkat
                </label>
                <textarea
                  rows={2}
                  className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary resize-none"
                  placeholder="Catatan persiapan, kontak HR, requirement khusus..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-3.5 sm:px-spacing-lg py-3 border-t border-surface-container bg-surface-container-low/40 flex-shrink-0">
          <button
            type="button"
            onClick={handleResetAndClose}
            className="px-3 sm:px-spacing-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs sm:text-label-md transition-colors cursor-pointer"
          >
            Batal
          </button>

          {inputMode === 'manual' ? (
            <button
              type="submit"
              form="add-job-manual-form"
              className="px-3.5 sm:px-spacing-md py-1.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-container font-label-md text-xs sm:text-label-md font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Simpan Lamaran
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className="px-3 sm:px-spacing-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs sm:text-label-md transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Lanjut ke Formulir</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
