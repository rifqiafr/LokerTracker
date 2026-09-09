import React from 'react';
import { SortOption } from '../../types/job';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  displayedCount: number;
  totalCount: number;
  onOpenAddJob: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  displayedCount,
  totalCount,
  onOpenAddJob,
}) => {
  return (
    <div className="flex flex-col bg-surface-container-lowest p-2 px-3 rounded-xl shadow-xs border border-surface-container/40 flex-shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Search Input & Sort Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex items-center w-full sm:w-64 md:w-72">
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

          {/* Sort Dropdown */}
          <div className="relative flex items-center flex-shrink-0">
            <span className="material-symbols-outlined absolute left-2 text-secondary text-base pointer-events-none">
              swap_vert
            </span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="pl-7 pr-7 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-xs rounded-lg border border-surface-container/60 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer shadow-xs appearance-none font-medium transition-colors"
              title="Urutkan lamaran"
            >
              <optgroup label="Urutkan Waktu">
                <option value="date-desc">Terbaru (Desc)</option>
                <option value="date-asc">Terlama (Asc)</option>
              </optgroup>
              <optgroup label="Urutkan Abjad Posisi">
                <option value="title-asc">Posisi: A → Z (Asc)</option>
                <option value="title-desc">Posisi: Z → A (Desc)</option>
              </optgroup>
              <optgroup label="Urutkan Abjad Perusahaan">
                <option value="company-asc">Perusahaan: A → Z (Asc)</option>
                <option value="company-desc">Perusahaan: Z → A (Desc)</option>
              </optgroup>
            </select>
            <span className="material-symbols-outlined absolute right-1.5 text-outline text-sm pointer-events-none">
              unfold_more
            </span>
          </div>
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
