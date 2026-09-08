import React from 'react';

interface HeaderProps {
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  userAvatarUrl?: string;
  onOpenSettings?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onToggleMobileNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userAvatarUrl: customAvatarUrl,
  onOpenSettings,
  isDarkMode = false,
  onToggleTheme,
  onToggleMobileNav,
}) => {
  const fallbackAvatarUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB54bT0t_lepVc3X6-LB6CyaOAxXOYuvXBcabktZAdJ-8mqfGquckld8-MY1J673PGF2hwi4mUmhO9oPuk2CuNtm2Xp_5mXloCLuBkxnfjAG_gr15l4aYcLKGe7qxENguCwVCYh2FZnzBQhWv9FcZB0UvDIVF_okLguwuMsbG9mCJoy2df2jf_sN0rU4Py_JQwvXtHiDnUQzUbAjjq_CHPUDms7vCwhAvSPC484xGi5RKr468O1iXDq';
  const userAvatarUrl = customAvatarUrl || fallbackAvatarUrl;

  return (
    <header className="w-full h-14 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 flex items-center justify-between px-3 sm:px-spacing-lg border-b border-surface-container/50 flex-shrink-0 gap-2">
      {/* Left side: Mobile Hamburger */}
      <div className="flex items-center gap-2">
        {onToggleMobileNav && (
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="p-1.5 -ml-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container lg:hidden flex items-center justify-center cursor-pointer flex-shrink-0"
            title="Buka Menu"
            aria-label="Buka Menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        )}
      </div>

      {/* Right side: Actions and User */}
      <div className="flex items-center gap-1.5 sm:gap-spacing-sm flex-shrink-0">
        <div className="hidden sm:flex items-center gap-spacing-3xs px-spacing-xs py-spacing-2xs rounded-lg bg-surface-container-low text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
          <span className="font-label-sm text-label-sm">Aktif</span>
        </div>

        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDarkMode ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all cursor-pointer ring-1 ring-surface-container/60 hover:ring-secondary/40 shadow-xs"
          >
            <span className="material-symbols-outlined text-base sm:text-lg leading-none">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenSettings}
          title="Buka Pengaturan"
          className="rounded-full ring-1 ring-secondary/20 hover:ring-2 hover:ring-secondary transition-all cursor-pointer overflow-hidden flex-shrink-0"
        >
          <img
            alt="Profile"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover bg-surface-container"
            src={userAvatarUrl}
          />
        </button>
      </div>
    </header>
  );
};
