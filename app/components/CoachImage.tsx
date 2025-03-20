'use client';

import Image from 'next/image';
import { useState } from 'react';

interface CoachImageProps {
  src: string;
  alt: string;
  fallbackInitial?: string;
}

export default function CoachImage({ src, alt, fallbackInitial = 'Z' }: CoachImageProps) {
  const [error, setError] = useState(false);
  
  if (error) {
    // Return fallback with initial
    return (
      <div className="w-full h-full bg-indigo-600 flex items-center justify-center">
        <span className="text-white text-xl font-semibold">{fallbackInitial}</span>
      </div>
    );
  }
  
  return (
    <Image 
      src={src}
      alt={alt}
      fill
      className="object-cover"
      onError={() => setError(true)}
    />
  );
} 