"use client"

import React from "react";
import Image from "next/image";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: number;
}

export function SimpleAvatar({ 
  src, 
  alt = "Avatar", 
  fallback = "U", 
  className = "", 
  size = 40 
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(!src);
  
  const handleImageError = () => {
    console.error("Failed to load avatar image:", src);
    setImageError(true);
  };
  
  // For debugging
  React.useEffect(() => {
    if (src) {
      console.log("Avatar attempting to load image:", src);
    }
  }, [src]);
  
  return (
    <div 
      className={`relative flex items-center justify-center rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 ${className}`}
      style={{ width: size, height: size }}
    >
      {!imageError && src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleImageError}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
      ) : (
        <span className="text-neutral-800 font-medium text-sm">
          {fallback}
        </span>
      )}
    </div>
  );
} 