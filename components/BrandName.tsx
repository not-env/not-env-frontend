'use client';

import Image from 'next/image';

interface BrandNameProps {
  className?: string;
  showSubtitle?: boolean;
  subtitle?: string;
}

export default function BrandName({ className = '', showSubtitle = false, subtitle }: BrandNameProps) {
  // For now, we're in light mode, so use dark name mark (dark text on light background)
  // When dark mode is implemented, we'll switch based on theme
  const isDarkMode = false; // TODO: Get from theme context when dark mode is implemented
  const imageSrc = isDarkMode ? '/name-mark-light.png' : '/name-mark-dark.png';
  const altText = 'not-env';

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={imageSrc}
        alt={altText}
        width={120}
        height={32}
        className="h-8 w-auto"
        style={{ height: 'auto', width: 'auto' }}
        priority
      />
      {showSubtitle && subtitle && (
        <span className="ml-3 text-sm font-normal" style={{ color: '#6B6B6B' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

