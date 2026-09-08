import React, { useState, useEffect } from 'react';
import { resolveCompanyLogo } from '../../utils/companyLogo';

interface CompanyLogoProps {
  company: string;
  logoLetter: string;
  logoColorClass: string;
  companyLogo?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  company,
  logoLetter,
  logoColorClass,
  companyLogo,
  size = 'sm',
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const logoUrl = resolveCompanyLogo(company, companyLogo);

  // Reset error state when logo or company changes
  useEffect(() => {
    setImgFailed(false);
  }, [company, companyLogo]);

  const sizeClasses = {
    sm: 'w-6 h-6 rounded text-[11px]',
    md: 'w-8 h-8 rounded-lg text-label-md',
    lg: 'w-12 h-12 rounded-xl text-headline-lg',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.sm;

  if (logoUrl && !imgFailed) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-container-lowest border border-surface-container/60 shadow-2xs overflow-hidden flex-shrink-0 select-none ${currentSizeClass} ${className}`}
        title={company}
      >
        <img
          src={logoUrl}
          alt={`Logo ${company}`}
          className="w-full h-full object-contain p-0.5 rounded transition-transform duration-200 group-hover:scale-105"
          onError={() => setImgFailed(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Graceful fallback to initial letter avatar
  return (
    <div
      className={`flex items-center justify-center font-bold select-none flex-shrink-0 ${currentSizeClass} ${logoColorClass} ${className}`}
      title={company}
    >
      {logoLetter}
    </div>
  );
};
