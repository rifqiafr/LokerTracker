import React from 'react';
import brandLogo from '../../assets/logo.png';

export type NavTab = 'board' | 'analytics' | 'archive' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  archiveCount?: number;
  currentUser?: { name: string; email: string; avatarUrl?: string } | null;
  onLogout?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  archiveCount = 0,
  currentUser,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const userAvatarUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB54bT0t_lepVc3X6-LB6CyaOAxXOYuvXBcabktZAdJ-8mqfGquckld8-MY1J673PGF2hwi4mUmhO9oPuk2CuNtm2Xp_5mXloCLuBkxnfjAG_gr15l4aYcLKGe7qxENguCwVCYh2FZnzBQhWv9FcZB0UvDIVF_okLguwuMsbG9mCJoy2df2jf_sN0rU4Py_JQwvXtHiDnUQzUbAjjq_CHPUDms7vCwhAvSPC484xGi5RKr468O1iXDq';

  const handleNavClick = (tab: NavTab) => {
    onTabChange(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Off-canvas Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-60 bg-surface-container-lowest shadow-[0_1px_12px_rgba(0,0,0,0.08)] z-50 flex flex-col justify-between select-none transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-14 lg:h-16 flex items-center justify-between px-spacing-md bg-surface-container-low/40 border-b border-surface-container/50">
            <div className="flex items-center gap-spacing-xs">
              <div className="h-9 w-9 rounded-xl overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center">
                <img
                  alt="LOKER Brand Logo"
                  className="h-full w-full object-cover"
                  src={brandLogo}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary leading-tight font-bold tracking-tight">
                  LOKER
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Job Tracker
                </span>
              </div>
            </div>

            {/* Close Button on Mobile Screen */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container lg:hidden flex items-center justify-center cursor-pointer"
              title="Tutup Menu"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Section Heading */}
          <div className="px-spacing-md pt-spacing-md pb-spacing-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Navigasi Utama
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-spacing-3xs px-spacing-xs">
            <button
              type="button"
              onClick={() => handleNavClick('board')}
              className={`flex items-center justify-between w-full px-spacing-sm py-spacing-xs rounded-lg transition-all text-left cursor-pointer ${
                currentTab === 'board'
                  ? 'bg-primary-container text-on-primary font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-spacing-sm">
                <span className="material-symbols-outlined text-lg">view_kanban</span>
                <span className="font-body-md text-body-md">Board</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('analytics')}
              className={`flex items-center justify-between w-full px-spacing-sm py-spacing-xs rounded-lg transition-all text-left cursor-pointer ${
                currentTab === 'analytics'
                  ? 'bg-primary-container text-on-primary font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-spacing-sm">
                <span className="material-symbols-outlined text-lg">bar_chart</span>
                <span className="font-body-md text-body-md">Analytics</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">
                Insight
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('archive')}
              className={`flex items-center justify-between w-full px-spacing-sm py-spacing-xs rounded-lg transition-all text-left cursor-pointer ${
                currentTab === 'archive'
                  ? 'bg-primary-container text-on-primary font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-spacing-sm">
                <span className="material-symbols-outlined text-lg">archive</span>
                <span className="font-body-md text-body-md">Arsip</span>
              </div>
              {archiveCount > 0 && (
                <span className="text-[11px] font-semibold px-1.5 py-0.2 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full">
                  {archiveCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('settings')}
              className={`flex items-center justify-between w-full px-spacing-sm py-spacing-xs rounded-lg transition-all text-left cursor-pointer ${
                currentTab === 'settings'
                  ? 'bg-primary-container text-on-primary font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-spacing-sm">
                <span className="material-symbols-outlined text-lg">settings</span>
                <span className="font-body-md text-body-md">Pengaturan</span>
              </div>
            </button>
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-spacing-xs flex flex-col gap-spacing-xs bg-surface-container-low/60 m-spacing-xs rounded-xl border border-surface-container-low">
          <button
            type="button"
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-spacing-xs text-left p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            title="Buka Pengaturan Profil"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-secondary/20 bg-surface-container flex-shrink-0"
              src={currentUser?.avatarUrl || userAvatarUrl}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                {currentUser?.name || 'Rian Pratama'}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                {currentUser?.email || 'rian.pratama@tech.id'}
              </span>
            </div>
            <span className="material-symbols-outlined text-sm text-on-surface-variant">chevron_right</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onLogout) onLogout();
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center justify-center gap-spacing-2xs px-spacing-xs py-spacing-2xs rounded-lg bg-surface-container-highest/60 hover:bg-error-container hover:text-on-error-container text-on-surface-variant transition-colors text-center w-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span className="font-label-sm text-label-sm">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};
