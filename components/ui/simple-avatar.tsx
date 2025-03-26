"use client"

import React from "react";
import Image from "next/image";
import { getImageSizes } from "@/utils/image-sizes";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: number;
}

export const SimpleAvatar = React.memo(function SimpleAvatar({ 
  src, 
  alt = "Avatar", 
  fallback = "U", 
  className = "", 
  size = 40 
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(!src);
  
  const handleImageError = React.useCallback(() => {
    setImageError(true);
  }, []);
  
  return (
    <div 
      className={`relative flex items-center justify-center rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 ${className}`}
      style={{ width: size, height: size }}
    >
      {!imageError && src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          onError={handleImageError}
          referrerPolicy="no-referrer"
          priority={false}
          sizes={`${size}px`}
        />
      ) : (
        <span className="text-neutral-800 font-medium text-sm">
          {fallback}
        </span>
      )}
    </div>
  );
}); 