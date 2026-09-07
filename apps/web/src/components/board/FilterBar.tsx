import React from 'react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  displayedCount: number;
  totalCount: number;
  onOpenAddJob: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  displayedCount,
  totalCount,
  onOpenAddJob,
}) => {
  return (
    <div className="flex flex-col bg-surface-container-lowest p-2 px-3 rounded-xl shadow-xs border border-surface-container/40 flex-shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Search Input */}
        <div className="relative flex items-center w-full sm:max-w-xs md:max-w-sm">
          <span className="material-symbols-outlined absolute left-2.5 text-secondary text-base pointer-events-none">
            search
          </span>
          <input
            className="w-full pl-8 pr-7 py-1.5 bg-surface-container-low rounded-lg text-on-surface font-body-sm text-xs focus:outline-none focus:ring-1 focus:ring-secondary shadow-xs"
            type="text"
            placeholder="Cari posisi / perusahaan..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Hapus teks pencarian"
              onClick={() => onSearchChange('')}
              className="absolute right-2 text-outline hover:text-on-surface flex items-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">cancel</span>
            </button>
          )}
        </div>

        {/* Counter and Primary CTA */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span className="text-[11px] sm:text-xs text-on-surface-variant whitespace-nowrap">
              <strong className="text-on-surface font-semibold">{displayedCount}</strong> /{' '}
              <strong className="text-on-surface font-semibold">{totalCount}</strong> lamaran
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAddJob}
            className="flex items-center gap-1 px-3 py-1 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Tambah Lamaran</span>
          </button>
        </div>
      </div>
    </div>
  );
};
