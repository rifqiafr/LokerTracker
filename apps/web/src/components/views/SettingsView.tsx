import React, { useState, useEffect, useRef } from 'react';
import { JobApplication } from '../../types/job';
import { authApi } from '../../services/api';

interface SettingsViewProps {
  currentUser: { name: string; email: string; avatarUrl?: string };
  onUpdateUser: (user: { name: string; email: string; avatarUrl?: string }) => void;
  jobs: JobApplication[];
  onResetJobs?: () => void;
  onLogout?: () => void;
  onShowToast?: (title: string, message: string) => void;
  isDarkMode?: boolean;
  onChangeTheme?: (theme: 'light' | 'dark') => void;
}

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB54bT0t_lepVc3X6-LB6CyaOAxXOYuvXBcabktZAdJ-8mqfGquckld8-MY1J673PGF2hwi4mUmhO9oPuk2CuNtm2Xp_5mXloCLuBkxnfjAG_gr15l4aYcLKGe7qxENguCwVCYh2FZnzBQhWv9FcZB0UvDIVF_okLguwuMsbG9mCJoy2df2jf_sN0rU4Py_JQwvXtHiDnUQzUbAjjq_CHPUDms7vCwhAvSPC484xGi5RKr468O1iXDq';

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onUpdateUser,
  jobs,
  onResetJobs,
  onLogout,
  onShowToast,
  isDarkMode = false,
  onChangeTheme,
}) => {
  // Sub tab navigation inside Settings
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'data'>('profile');

  // Profile Form States
  const [name, setName] = useState(currentUser.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || DEFAULT_AVATAR);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [headline, setHeadline] = useState(() => localStorage.getItem('loker_setting_headline') || 'Frontend Engineer / React Developer');
  const [location, setLocation] = useState(() => localStorage.getItem('loker_setting_location') || 'Jakarta, Indonesia (Hybrid / Remote)');
  const [targetSalary, setTargetSalary] = useState(() => localStorage.getItem('loker_setting_salary') || 'Rp 15.000.000 - Rp 25.000.000');
  const [workTypePreference, setWorkTypePreference] = useState<'All' | 'Remote' | 'Hybrid' | 'On-site'>(
    () => (localStorage.getItem('loker_setting_worktype') as any) || 'Hybrid'
  );
  const [bio, setBio] = useState(
    () =>
      localStorage.getItem('loker_setting_bio') ||
      'Software engineer yang berfokus pada antarmuka web modern, React, TypeScript, dan performa tinggi.'
  );

  // Application Preferences
  const [currency, setCurrency] = useState<'IDR' | 'USD'>(() => (localStorage.getItem('loker_pref_currency') as any) || 'IDR');
  const [showAiMatch, setShowAiMatch] = useState(() => localStorage.getItem('loker_pref_aimatch') !== 'false');
  const [enableReminders, setEnableReminders] = useState(() => localStorage.getItem('loker_pref_reminders') !== 'false');
  const [compactCards, setCompactCards] = useState(() => localStorage.getItem('loker_pref_compact') === 'true');


  // Save feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    setName(currentUser.name || '');
    if (currentUser.avatarUrl) {
      setAvatarUrl(currentUser.avatarUrl);
    }
  }, [currentUser]);

  // Handle image upload & processing (resizing and square crop via canvas)
  const processImageFile = (file: File) => {
    setUploadError('');
    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa format gambar (JPG, PNG, WEBP, atau GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Ukuran file terlalu besar (maksimal 10MB).');
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const targetSize = 400; // Optimal 400x400 for high DPI displays
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas context tidak tersedia');
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Center crop cover mode
          let sx = 0;
          let sy = 0;
          let sw = img.width;
          let sh = img.height;

          if (img.width > img.height) {
            sw = img.height;
            sx = (img.width - img.height) / 2;
          } else if (img.height > img.width) {
            sh = img.width;
            sy = (img.height - img.width) / 2;
          }

          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetSize, targetSize);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

          setAvatarUrl(dataUrl);
          setUploadedFileName(file.name);
          setIsProcessingImage(false);

          if (onShowToast) {
            onShowToast('Foto Terpilih', `${file.name} siap disimpan sebagai foto profil.`);
          }
        } catch (err) {
          console.error('Failed to process image:', err);
          // Fallback to raw data url
          setAvatarUrl(readerEvent.target?.result as string);
          setUploadedFileName(file.name);
          setIsProcessingImage(false);
        }
      };
      img.onerror = () => {
        setUploadError('Gagal memuat gambar. Silakan coba file lain.');
        setIsProcessingImage(false);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca file dari komputer.');
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleResetAvatar = () => {
    setAvatarUrl(DEFAULT_AVATAR);
    setUploadedFileName('');
    setUploadError('');
    if (onShowToast) {
      onShowToast('Foto Direset', 'Foto profil dikembalikan ke tampilan standar.');
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setSaveSuccessMsg('');

    try {
      // Save local preferences
      localStorage.setItem('loker_setting_headline', headline);
      localStorage.setItem('loker_setting_location', location);
      localStorage.setItem('loker_setting_salary', targetSalary);
      localStorage.setItem('loker_setting_worktype', workTypePreference);
      localStorage.setItem('loker_setting_bio', bio);

      // Attempt to sync to backend if authenticated
      try {
        const updated = await authApi.updateProfile({
          name: name.trim(),
          avatarUrl,
        });
        onUpdateUser({
          ...currentUser,
          name: updated.name,
          avatarUrl: updated.avatarUrl || avatarUrl,
        });
      } catch (backendErr) {
        // Fallback local update
        onUpdateUser({
          ...currentUser,
          name: name.trim(),
          avatarUrl,
        });
      }

      setSaveSuccessMsg('Profil dan preferensi berhasil disimpan!');
      if (onShowToast) {
        onShowToast('Pengaturan Disimpan', 'Informasi profil dan preferensi kerja berhasil diperbarui.');
      }
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Preference Change
  const handleTogglePreference = (key: 'aimatch' | 'reminders' | 'compact', val: boolean) => {
    if (key === 'aimatch') {
      setShowAiMatch(val);
      localStorage.setItem('loker_pref_aimatch', String(val));
    } else if (key === 'reminders') {
      setEnableReminders(val);
      localStorage.setItem('loker_pref_reminders', String(val));
    } else if (key === 'compact') {
      setCompactCards(val);
      localStorage.setItem('loker_pref_compact', String(val));
    }
    if (onShowToast) {
      onShowToast('Preferensi Diperbarui', 'Pilihan preferensi telah disimpan secara lokal.');
    }
  };

  const handleChangeCurrency = (val: 'IDR' | 'USD') => {
    setCurrency(val);
    localStorage.setItem('loker_pref_currency', val);
    if (onShowToast) {
      onShowToast('Mata Uang Diubah', `Format tampilan gaji diatur ke ${val}.`);
    }
  };

  // Export data as JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(jobs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loker-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) {
      onShowToast('Ekspor Berhasil', `${jobs.length} data lamaran berhasil diunduh dalam format JSON.`);
    }
  };

  // Export data as CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Perusahaan', 'Posisi', 'Tahap', 'Lokasi', 'Gaji', 'Prioritas', 'Tanggal Lamaran', 'Catatan', 'Diarsipkan'];
    const rows = jobs.map((j) => [
      `"${j.id}"`,
      `"${(j.company || '').replace(/"/g, '""')}"`,
      `"${(j.title || '').replace(/"/g, '""')}"`,
      `"${j.stage}"`,
      `"${(j.location || '').replace(/"/g, '""')}"`,
      `"${(j.salary || '').replace(/"/g, '""')}"`,
      `"${j.priority || 'medium'}"`,
      `"${j.appliedDate || ''}"`,
      `"${(j.notes?.join(' ') || '').replace(/"/g, '""')}"`,
      `"${j.isArchived ? 'Ya' : 'Tidak'}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loker-tracker-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) {
      onShowToast('Ekspor CSV Selesai', `${jobs.length} baris data lamaran berhasil diekspor.`);
    }
  };


  return (
    <div className="flex flex-col gap-spacing-lg pb-spacing-3xl max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-spacing-sm pb-spacing-xs border-b border-surface-container/60">
        <div>
          <div className="flex items-center gap-spacing-xs">
            <span className="material-symbols-outlined text-2xl text-secondary">tune</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Pengaturan Sistem &amp; Profil
            </h1>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Kelola identitas kandidat, preferensi tampilan papan, dan cadangan data lamaran.
          </p>
        </div>

        {saveSuccessMsg && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold animate-in fade-in">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {saveSuccessMsg}
          </div>
        )}
      </div>

      {/* Tab Selector Nav */}
      <div className="flex items-center gap-spacing-2xs p-1 bg-surface-container-low rounded-xl border border-surface-container/60 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-spacing-xs px-spacing-md py-spacing-xs rounded-lg font-label-md text-label-md font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
          }`}
        >
          <span className="material-symbols-outlined text-lg">badge</span>
          <span>Profil Kandidat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-spacing-xs px-spacing-md py-spacing-xs rounded-lg font-label-md text-label-md font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
          }`}
        >
          <span className="material-symbols-outlined text-lg">display_settings</span>
          <span>Preferensi Papan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-spacing-xs px-spacing-md py-spacing-xs rounded-lg font-label-md text-label-md font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'data'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
          }`}
        >
          <span className="material-symbols-outlined text-lg">download</span>
          <span>Cadangan &amp; Ekspor</span>
        </button>
      </div>

      {/* TAB 1: PROFIL KANDIDAT */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-spacing-lg">
          {/* Avatar Section: Custom Upload */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-surface-container-lowest p-spacing-lg rounded-2xl border transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center gap-spacing-lg ${
              isDragging
                ? 'border-secondary border-dashed ring-4 ring-secondary/20 bg-secondary/5'
                : 'border-surface-container/70'
            }`}
          >
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Profile Picture Interactive Avatar */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group flex-shrink-0 cursor-pointer"
              title="Klik untuk memilih foto baru dari perangkat Anda"
            >
              <img
                src={avatarUrl}
                alt="Avatar Foto Profil"
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-secondary/25 shadow-md bg-surface-container transition-transform group-hover:scale-105"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 rounded-2xl bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 backdrop-blur-[2px]">
                <span className="material-symbols-outlined text-xl">photo_camera</span>
                <span className="text-[10px] font-semibold tracking-wide uppercase">Ganti Foto</span>
              </div>

              {/* Edit badge */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md ring-2 ring-surface-container-lowest group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-sm">upload</span>
              </div>
            </div>

            {/* Upload Controls & Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Foto Profil Kandidat
                </h3>
                {avatarUrl && avatarUrl.startsWith('data:') && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary/30">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Foto Kustom Aktif
                  </span>
                )}
              </div>

              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-spacing-sm">
                Unggah foto profil asli Anda dari komputer atau galeri ponsel untuk menampilkan identitas profesional Anda.
              </p>

              {/* Upload Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-on-primary text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">
                    {isProcessingImage ? 'sync' : 'upload_file'}
                  </span>
                  <span>{isProcessingImage ? 'Memproses Foto...' : 'Unggah Foto dari Perangkat'}</span>
                </button>

                {avatarUrl !== DEFAULT_AVATAR && (
                  <button
                    type="button"
                    onClick={handleResetAvatar}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-error text-xs font-medium border border-surface-container transition-all cursor-pointer"
                    title="Kembalikan ke foto standar"
                  >
                    <span className="material-symbols-outlined text-sm">restart_alt</span>
                    <span>Reset ke Standar</span>
                  </button>
                )}
              </div>

              {/* Drag drop info & support notice */}
              <div className="mt-2.5 flex items-center gap-2 text-[11px] text-on-surface-variant">
                <span className="material-symbols-outlined text-sm text-outline">info</span>
                <span>
                  Mendukung JPG, PNG, WEBP, atau GIF (Maks. 10MB). Anda juga dapat menyeret file gambar langsung ke kotak ini.
                </span>
              </div>

              {/* Status File Indicator */}
              {uploadedFileName && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  <span className="truncate max-w-xs">{uploadedFileName}</span>
                  <span className="text-[10px] text-emerald-600 font-normal">(siap disimpan)</span>
                </div>
              )}

              {/* Upload Error feedback */}
              {uploadError && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-error-container text-on-error-container text-xs font-medium">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Identity & Career Details */}
          <div className="bg-surface-container-lowest p-spacing-lg rounded-2xl border border-surface-container/70 shadow-sm flex flex-col gap-spacing-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">person</span>
              Informasi Pribadi &amp; Karir
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-md">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low/60 border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary text-sm font-medium text-on-surface"
                  placeholder="Contoh: Rian Pratama"
                />
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Email Terdaftar</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">
                    Tersimpan di SQLite
                  </span>
                </label>
                <input
                  type="email"
                  readOnly
                  value={currentUser.email}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high/60 text-sm font-medium text-on-surface-variant cursor-not-allowed"
                />
              </div>

              {/* Posisi Impian / Headline */}
              <div>
                <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                  Headline / Target Posisi
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low/60 border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary text-sm font-medium text-on-surface"
                  placeholder="Contoh: Senior Fullstack Engineer"
                />
              </div>

              {/* Domisili / Lokasi */}
              <div>
                <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                  Domisili / Lokasi
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low/60 border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary text-sm font-medium text-on-surface"
                  placeholder="Contoh: Jakarta, Indonesia"
                />
              </div>

              {/* Ekspektasi Gaji Target */}
              <div>
                <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                  Ekspektasi Gaji Bulanan
                </label>
                <input
                  type="text"
                  value={targetSalary}
                  onChange={(e) => setTargetSalary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low/60 border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary text-sm font-medium text-on-surface"
                  placeholder="Contoh: Rp 18.000.000 - Rp 25.000.000"
                />
              </div>

              {/* Preferensi Kerja */}
              <div>
                <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                  Preferensi Kerja
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['All', 'Remote', 'Hybrid', 'On-site'] as const).map((wt) => (
                    <button
                      key={wt}
                      type="button"
                      onClick={() => setWorkTypePreference(wt)}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        workTypePreference === wt
                          ? 'bg-secondary text-on-secondary border-secondary shadow-sm'
                          : 'bg-surface-container-low/50 text-on-surface-variant border-surface-container hover:bg-surface-container'
                      }`}
                    >
                      {wt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bio / Catatan Singkat */}
            <div>
              <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Bio &amp; Ringkasan Ringkas
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low/60 border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary text-sm font-medium text-on-surface"
                placeholder="Tuliskan pengalaman kunci, keahlian utama, atau deskripsi singkat untuk cover letter..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-spacing-sm pt-spacing-sm border-t border-surface-container/60">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-spacing-lg py-2.5 rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 font-label-md text-label-md font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    <span>Simpan Perubahan Profil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: PREFERENSI PAPAN */}
      {activeTab === 'preferences' && (
        <div className="flex flex-col gap-spacing-lg">
          <div className="bg-surface-container-lowest p-spacing-lg rounded-2xl border border-surface-container/70 shadow-sm flex flex-col gap-spacing-lg">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">palette</span>
                Preferensi Visual &amp; Format
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Sesuaikan format angka dan elemen yang ingin Anda tampilkan pada kartu Kanban.
              </p>
            </div>

            {/* Theme Choice */}
            {onChangeTheme && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-spacing-md rounded-xl bg-surface-container-low/50 border border-surface-container gap-spacing-sm">
                <div>
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-base">
                      {isDarkMode ? 'dark_mode' : 'light_mode'}
                    </span>
                    <span>Mode Tampilan Aplikasi</span>
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Beralih antara mode gelap (dark mode) yang nyaman di mata atau mode terang (light mode) standar.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChangeTheme('light')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      !isDarkMode
                        ? 'bg-secondary text-on-secondary border-secondary shadow-sm'
                        : 'bg-surface-container text-on-surface-variant border-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">light_mode</span>
                    <span>Terang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeTheme('dark')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isDarkMode
                        ? 'bg-secondary text-on-secondary border-secondary shadow-sm'
                        : 'bg-surface-container text-on-surface-variant border-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">dark_mode</span>
                    <span>Gelap</span>
                  </button>
                </div>
              </div>
            )}

            {/* Currency Choice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-spacing-md rounded-xl bg-surface-container-low/50 border border-surface-container gap-spacing-sm">
              <div>
                <span className="font-label-lg text-label-lg font-semibold text-on-surface block">
                  Format Mata Uang Gaji
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Gunakan format Rupiah (Rp) untuk loker lokal atau Dolar ($) untuk internasional.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleChangeCurrency('IDR')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    currency === 'IDR'
                      ? 'bg-secondary text-on-secondary border-secondary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant border-surface-container-high'
                  }`}
                >
                  IDR (Rp)
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeCurrency('USD')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-secondary text-on-secondary border-secondary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant border-surface-container-high'
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>

            {/* AI Match Score Toggle */}
            <div className="flex items-center justify-between p-spacing-md rounded-xl bg-surface-container-low/50 border border-surface-container">
              <div>
                <span className="font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-2">
                  <span>Tampilkan AI Match Score</span>
                  <span className="text-[10px] px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-bold">
                    95% Match
                  </span>
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Tampilkan badge kecocokan profil kandidat pada kartu lamaran Kanban.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAiMatch}
                  onChange={(e) => handleTogglePreference('aimatch', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>

            {/* Interview Reminders Toggle */}
            <div className="flex items-center justify-between p-spacing-md rounded-xl bg-surface-container-low/50 border border-surface-container">
              <div>
                <span className="font-label-lg text-label-lg font-semibold text-on-surface block">
                  Notifikasi Pengingat Interview
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Dapatkan tanda pengingat pada header saat ada jadwal wawancara terdekat.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableReminders}
                  onChange={(e) => handleTogglePreference('reminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>

            {/* Compact Card Mode */}
            <div className="flex items-center justify-between p-spacing-md rounded-xl bg-surface-container-low/50 border border-surface-container">
              <div>
                <span className="font-label-lg text-label-lg font-semibold text-on-surface block">
                  Mode Kartu Padat (Compact View)
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Mengurangi padding antar kartu agar muat lebih banyak lamaran sekaligus di layar.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={compactCards}
                  onChange={(e) => handleTogglePreference('compact', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CADANGAN & EKSPOR DATA */}
      {activeTab === 'data' && (
        <div className="flex flex-col gap-spacing-lg">
          <div className="bg-surface-container-lowest p-spacing-lg rounded-2xl border border-surface-container/70 shadow-sm flex flex-col gap-spacing-md">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">backup</span>
                Ekspor &amp; Cadangkan Data Lamaran
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Unduh seluruh rekaman riwayat lamaran Anda untuk analisis di Excel/Sheets atau integrasi lainnya.
              </p>
            </div>

            {/* Quick Data Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-spacing-sm py-spacing-xs">
              <div className="p-spacing-md rounded-xl bg-surface-container-low/60 border border-surface-container">
                <span className="text-xs text-on-surface-variant font-medium block">Total Lamaran Terdata</span>
                <span className="text-2xl font-bold text-on-surface">{jobs.length}</span>
              </div>
              <div className="p-spacing-md rounded-xl bg-surface-container-low/60 border border-surface-container">
                <span className="text-xs text-on-surface-variant font-medium block">Lamaran Aktif di Board</span>
                <span className="text-2xl font-bold text-secondary">
                  {jobs.filter((j) => !j.isArchived).length}
                </span>
              </div>
              <div className="p-spacing-md rounded-xl bg-surface-container-low/60 border border-surface-container">
                <span className="text-xs text-on-surface-variant font-medium block">Diarsipkan</span>
                <span className="text-2xl font-bold text-on-surface-variant">
                  {jobs.filter((j) => j.isArchived).length}
                </span>
              </div>
            </div>

            {/* Export Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-md pt-spacing-sm">
              <div className="p-spacing-md rounded-xl bg-surface-container-low/40 border border-surface-container flex flex-col justify-between gap-spacing-sm">
                <div>
                  <div className="flex items-center gap-2 text-on-surface font-semibold">
                    <span className="material-symbols-outlined text-emerald-600">table_chart</span>
                    <span>Ekspor Format Excel / CSV</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Cocok untuk dibuka langsung di Microsoft Excel, Google Sheets, atau Numbers. Berisi perusahaan, posisi, status, dan gaji.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-label-md text-label-md font-semibold transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span>Unduh .CSV</span>
                </button>
              </div>

              <div className="p-spacing-md rounded-xl bg-surface-container-low/40 border border-surface-container flex flex-col justify-between gap-spacing-sm">
                <div>
                  <div className="flex items-center gap-2 text-on-surface font-semibold">
                    <span className="material-symbols-outlined text-indigo-600">data_object</span>
                    <span>Ekspor Format JSON (Full Raw)</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Cadangan penuh dengan struktur JSON terformat rapi untuk dipulihkan kembali atau diproses API.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-label-md text-label-md font-semibold transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">file_download</span>
                  <span>Unduh .JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-error-container/20 p-spacing-lg rounded-2xl border border-error-container flex flex-col gap-spacing-sm">
            <h4 className="font-headline-sm text-headline-sm text-on-error-container font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">warning</span>
              Zona Pengelolaan Akun
            </h4>
            <p className="text-xs text-on-surface-variant">
              Tindakan di bawah ini mengatur ulang sesi aplikasi lokal atau data contoh.
            </p>

            <div className="flex flex-wrap items-center gap-spacing-sm pt-spacing-xs">
              {onResetJobs && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Kembalikan papan ke data awal contoh?')) {
                      onResetJobs();
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container text-xs font-bold text-on-surface transition-colors cursor-pointer"
                >
                  Reset Papan ke Data Contoh
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 rounded-lg bg-error text-on-error hover:bg-error/90 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>Keluar dari Akun</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
