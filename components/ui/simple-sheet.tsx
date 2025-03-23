"use client"

import React, { useState, useEffect, useRef } from "react";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "right" | "left" | "top" | "bottom";
  className?: string;
}

export function SimpleSheet({ 
  isOpen, 
  onClose, 
  children, 
  side = "right", 
  className = "" 
}: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent scrolling when sheet is open
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = ""; // Restore scrolling when sheet is closed
    };
  }, [isOpen, onClose]);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // Determine positioning based on side
  let positionClasses = "";
  if (side === "right") {
    positionClasses = "top-0 right-0 h-full";
  } else if (side === "left") {
    positionClasses = "top-0 left-0 h-full";
  } else if (side === "top") {
    positionClasses = "top-0 left-0 right-0";
  } else if (side === "bottom") {
    positionClasses = "bottom-0 left-0 right-0";
  }
  
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        ref={sheetRef}
        className={`
          fixed bg-white dark:bg-neutral-800 shadow-lg z-50 w-[280px] 
          ${positionClasses} ${className}
          pt-safe-top pb-safe-bottom pr-safe-right pl-safe-left
          flex flex-col
        `}
      >
        {/* Content wrapper with proper padding accounting for safe areas */}
        <div className="p-6 relative flex-1 overflow-y-auto">
          {/* Close button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1 rounded-sm text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
          
          {children}
        </div>
      </div>
    </>
  );
}

export function SimpleSheetTitle({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <h3 className={`text-lg font-semibold mb-1 dark:text-neutral-100 ${className}`}>{children}</h3>
  );
}

export function SimpleSheetDescription({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <p className={`text-sm text-neutral-500 dark:text-neutral-400 mb-4 ${className}`}>{children}</p>
  );
} 