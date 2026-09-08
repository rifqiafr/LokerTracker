import { useState, useMemo, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/board/FilterBar';
import { KanbanBoard } from './components/board/KanbanBoard';
import { JobDetailDrawer } from './components/drawer/JobDetailDrawer';
import { AddJobModal } from './components/modal/AddJobModal';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ArchiveView } from './components/views/ArchiveView';
import { SettingsView } from './components/views/SettingsView';
import { AuthPage } from './components/auth/AuthPage';
import { Toast } from './components/common/Toast';
import { COLUMNS, INITIAL_JOBS } from './data/initialJobs';
import { JobApplication, Stage } from './types/job';
import { jobsApi, authApi, getAuthToken, clearAuthToken } from './services/api';

export function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatarUrl?: string }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('loker_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return {
      name: 'Rian Pratama',
      email: 'demo@loker.id',
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash.toLowerCase();
      if (h === '#login' || h === '#register' || h === '#auth') {
        return false;
      }
      return !!getAuthToken();
    }
    return true;
  });

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h === '#login' || h === '#register' || h === '#auth') {
        setIsAuthenticated(false);
      } else if (h === '#board') {
        setIsAuthenticated(true);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('loker_theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('loker_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('loker_theme', 'light');
      }
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Mobile drawer state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('board');

  // Job data state - load from cache first to avoid flashing dummy data on refresh
  const [jobs, setJobs] = useState<JobApplication[]>(() => {
    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      const cached = localStorage.getItem('loker_cached_jobs');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // fallback
        }
      }
      // If user is authenticated, start with empty list instead of flashing dummy data
      if (token) {
        return [];
      }
    }
    return INITIAL_JOBS;
  });

  // Fetch jobs and user profile from backend when authenticated
  useEffect(() => {
    if (isAuthenticated && getAuthToken()) {
      jobsApi.getJobs()
        .then((fetchedJobs) => {
          const result = fetchedJobs || [];
          setJobs(result);
          if (typeof window !== 'undefined') {
            localStorage.setItem('loker_cached_jobs', JSON.stringify(result));
          }
        })
        .catch((err) => {
          console.warn('Backend fetch failed, using local/cached jobs:', err);
        });

      authApi.getMe()
        .then((user) => {
          if (user) {
            setCurrentUser(user);
            localStorage.setItem('loker_user', JSON.stringify(user));
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch user profile:', err);
        });
    }
  }, [isAuthenticated]);

  // Keep local cache in sync with current state
  useEffect(() => {
    if (typeof window !== 'undefined' && getAuthToken() && jobs && jobs !== INITIAL_JOBS) {
      localStorage.setItem('loker_cached_jobs', JSON.stringify(jobs));
    }
  }, [jobs]);

  // Selected Job for Notion-style Drawer
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Search Query State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetModalStage, setTargetModalStage] = useState<Stage>('applied');

  // Toast State
  const [toastInfo, setToastInfo] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  // Filter logic: only exclude archived and match search text
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Exclude archived from active board
      if (job.isArchived) return false;

      // Search query filter (title or company)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const normalizedTitle = job.title.toLowerCase().replace('-', ' ');
        const matchesNormalized = normalizedTitle.includes(q.replace('-', ' '));

        if (!matchesTitle && !matchesCompany && !matchesNormalized) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, searchQuery]);

  const totalActiveCount = jobs.filter((j) => !j.isArchived).length;
  const archivedJobs = jobs.filter((j) => j.isArchived);

  // Handlers
  const handleSelectJob = (job: JobApplication) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  const handleOpenAddModal = (stage: Stage = 'applied') => {
    setTargetModalStage(stage);
    setIsAddModalOpen(true);
  };

  const handleAddJob = async (newJobData: Partial<JobApplication>) => {
    const tempId = `job-${Date.now()}`;
    const newJob: JobApplication = {
      id: tempId,
      title: newJobData.title || 'Untitled Role',
      company: newJobData.company || 'Unknown Company',
      logoLetter: newJobData.logoLetter || 'UK',
      logoColorClass: newJobData.logoColorClass || 'bg-surface-container text-on-surface',
      stage: newJobData.stage || 'applied',
      workType: newJobData.workType || 'Remote',
      location: newJobData.location,
      salary: newJobData.salary || '15-25jt',
      salaryMin: 15,
      salaryMax: 25,
      appliedDate: newJobData.appliedDate,
      applyUrl: newJobData.applyUrl,
      notes: newJobData.notes,
      timeline: newJobData.timeline,
      isArchived: false,
    };

    setJobs((prev) => [newJob, ...prev]);
    setToastInfo({
      isOpen: true,
      title: 'Lamaran berhasil ditambahkan',
      message: `Posisi tersimpan di kolom ${newJob.stage.toUpperCase()}`,
    });

    if (getAuthToken()) {
      try {
        const fullNotes = [
          newJobData.applyUrl ? `Link: ${newJobData.applyUrl}` : '',
          ...(newJobData.notes || []),
        ]
          .filter(Boolean)
          .join('\n');

        const created = await jobsApi.createJob({
          company: newJobData.company || 'Unknown Company',
          role: newJobData.title || 'Untitled Role',
          location: newJobData.location,
          salary: newJobData.salary,
          status: newJobData.stage || 'applied',
          priority: newJobData.priority || 'medium',
          notes: fullNotes,
        });
        setJobs((prev) => prev.map((j) => (j.id === tempId ? { ...created, applyUrl: newJobData.applyUrl } : j)));
      } catch (err) {
        console.error('Failed to sync new job to backend:', err);
      }
    }
  };

  const handleMoveStage = async (jobId: string, newStage: Stage) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, stage: newStage } : j))
    );
    if (selectedJob?.id === jobId) {
      setSelectedJob((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
    setToastInfo({
      isOpen: true,
      title: 'Status Diperbarui',
      message: `Lamaran dipindahkan ke tahap ${newStage.toUpperCase()}`,
    });

    if (getAuthToken()) {
      try {
        await jobsApi.updateJobStatus(jobId, newStage);
      } catch (err) {
        console.error('Failed to sync stage to backend:', err);
      }
    }
  };

  const handleArchiveJob = async (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, isArchived: true } : j))
    );
    if (selectedJob?.id === jobId) {
      setIsDrawerOpen(false);
    }
    setToastInfo({
      isOpen: true,
      title: 'Lamaran Diarsipkan',
      message: 'Dapat dilihat di menu Arsip',
    });

    if (getAuthToken()) {
      try {
        await jobsApi.archiveJob(jobId, true);
      } catch (err) {
        console.error('Failed to sync archive to backend:', err);
      }
    }
  };

  const handleRestoreJob = async (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, isArchived: false } : j))
    );
    setToastInfo({
      isOpen: true,
      title: 'Lamaran Dipulihkan',
      message: 'Posisi kembali aktif di papan Kanban',
    });

    if (getAuthToken()) {
      try {
        await jobsApi.archiveJob(jobId, false);
      } catch (err) {
        console.error('Failed to sync restore to backend:', err);
      }
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    if (selectedJob?.id === jobId) {
      setIsDrawerOpen(false);
      setSelectedJob(null);
    }
    setToastInfo({
      isOpen: true,
      title: 'Lamaran Dihapus',
      message: 'Data lamaran berhasil dihapus permanen',
    });

    if (getAuthToken()) {
      try {
        await jobsApi.deleteJob(jobId);
      } catch (err) {
        console.error('Failed to sync job deletion to backend:', err);
      }
    }
  };

  const handleSaveDrawerJob = async (updated: JobApplication) => {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
    setSelectedJob(updated);
    setToastInfo({
      isOpen: true,
      title: 'Perubahan Disimpan',
      message: 'Catatan dan data lamaran berhasil disimpan',
    });

    if (getAuthToken()) {
      try {
        await jobsApi.updateJob(updated.id, updated);
      } catch (err) {
        console.error('Failed to sync updated job to backend:', err);
      }
    }
  };



  // If user is logged out, show Login & Register page
  if (!isAuthenticated) {
    return (
      <>
        <Toast
          isOpen={toastInfo.isOpen}
          title={toastInfo.title}
          message={toastInfo.message}
          onClose={() => setToastInfo((prev) => ({ ...prev, isOpen: false }))}
        />
        <AuthPage
          onLoginSuccess={(userData) => {
            setCurrentUser(userData);
            setIsAuthenticated(true);
            setJobs([]);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('loker_cached_jobs');
            }
            window.location.hash = '';
            setToastInfo({
              isOpen: true,
              title: 'Berhasil Masuk',
              message: `Selamat datang, ${userData.name}!`,
            });
          }}
        />
      </>
    );
  }

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    window.location.hash = '#login';
    setToastInfo({
      isOpen: true,
      title: 'Telah Keluar',
      message: 'Anda telah keluar dari sesi LOKER',
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-on-surface font-body-md select-none">
      {/* Toast Notification */}
      <Toast
        isOpen={toastInfo.isOpen}
        title={toastInfo.title}
        message={toastInfo.message}
        onClose={() => setToastInfo((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Modern Slim Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        archiveCount={archivedJobs.length}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Area */}
      <div className="w-full lg:pl-60 h-screen flex flex-col overflow-hidden">
        {/* Top Header */}
        <Header
          searchTerm={searchQuery}
          onSearchChange={setSearchQuery}
          userAvatarUrl={currentUser?.avatarUrl}
          onOpenSettings={() => setCurrentTab('settings')}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
        />

        {/* Content View fitting 100% viewport */}
        <main className="flex-1 min-h-0 w-full px-2 sm:px-spacing-md py-2 flex flex-col gap-2 overflow-hidden">
          {currentTab === 'board' && (
            <>
              {/* Metrics & Action Header */}
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                displayedCount={filteredJobs.length}
                totalCount={totalActiveCount}
                onOpenAddJob={() => handleOpenAddModal('applied')}
              />

              {/* Kanban Canvas - fits 100% height and 100% width with 5 columns */}
              <div className="flex-1 min-h-0 w-full overflow-hidden">
                <KanbanBoard
                  columns={COLUMNS}
                  jobs={filteredJobs}
                  selectedJobId={selectedJob?.id}
                  onSelectJob={handleSelectJob}
                  onAddJobToStage={handleOpenAddModal}
                  onMoveStage={handleMoveStage}
                  onArchiveJob={handleArchiveJob}
                />
              </div>
            </>
          )}

          {currentTab === 'analytics' && (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <AnalyticsView jobs={jobs} />
            </div>
          )}

          {currentTab === 'archive' && (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <ArchiveView
                archivedJobs={archivedJobs}
                onRestore={handleRestoreJob}
                onDelete={handleDeleteJob}
              />
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <SettingsView
                currentUser={currentUser}
                onUpdateUser={setCurrentUser}
                jobs={jobs}
                isDarkMode={isDarkMode}
                onChangeTheme={(theme) => setIsDarkMode(theme === 'dark')}
                onResetJobs={() => {
                  setJobs(INITIAL_JOBS);
                  setToastInfo({
                    isOpen: true,
                    title: 'Papan Direset',
                    message: 'Data papan telah dikembalikan ke data contoh bawaan.',
                  });
                }}
                onLogout={handleLogout}
                onShowToast={(title, message) => setToastInfo({ isOpen: true, title, message })}
              />
            </div>
          )}
        </main>

        {/* Notion-Style Detail Slide-Over Overlay */}
        <JobDetailDrawer
          job={selectedJob}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSave={handleSaveDrawerJob}
          onDelete={handleDeleteJob}
          onMoveStage={handleMoveStage}
        />
      </div>

      {/* Add Job Modal */}
      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddJob={handleAddJob}
        defaultStage={targetModalStage}
      />
    </div>
  );
}

export default App;
