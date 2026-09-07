import React, { useEffect } from 'react';

interface ToastProps {
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  title,
  message,
  isOpen,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 right-8 z-50 flex items-center gap-spacing-xs px-spacing-md py-spacing-xs bg-surface-container-lowest shadow-xl rounded-xl transition-all duration-300 transform translate-y-0 opacity-100 border border-surface-container-low animate-in fade-in slide-in-from-top-2"
    >
      <div className="w-6 h-6 rounded-full bg-tertiary-fixed-dim/30 flex items-center justify-center text-on-tertiary-container flex-shrink-0">
        <span className="material-symbols-outlined text-base font-bold">check_circle</span>
      </div>
      <div className="flex flex-col">
        <span className="font-label-md text-label-md text-on-surface font-semibold">{title}</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">{message}</span>
      </div>
      <button
        type="button"
        aria-label="Tutup notifikasi"
        className="ml-spacing-xs text-outline hover:text-on-surface flex items-center p-1 rounded-md transition-colors"
        onClick={onClose}
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};
