'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ className = '', size = 'medium' }: LogoProps) {
  // For now, we're in light mode, so use dark logo (dark logo on light background)
  // When dark mode is implemented, we'll switch based on theme
  const isDarkMode = false; // TODO: Get from theme context when dark mode is implemented
  const imageSrc = isDarkMode ? '/logo-light.png' : '/logo-dark.png';
  const altText = 'not-env';

  // Size mappings
  const sizeMap = {
    small: { width: 120, height: 120 },
    medium: { width: 180, height: 180 },
    large: { width: 240, height: 240 },
  };

  const dimensions = sizeMap[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src={imageSrc}
        alt={altText}
        width={dimensions.width}
        height={dimensions.height}
        className="w-auto h-auto"
        style={{ height: 'auto', width: 'auto' }}
        priority
      />
    </div>
  );
}

