"use client";

import { useState, useEffect, useRef } from "react";

export default function HydrationSafeTest() {
  const [eventCount, setEventCount] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [documentHeight, setDocumentHeight] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const lastScrollY = useRef(0);
  
  // Wait for Next.js hydration to complete
  useEffect(() => {
    setIsHydrated(true);
    console.log("Component hydrated");
  }, []);
  
  // Set up scroll detection only after hydration
  useEffect(() => {
    if (!isHydrated) return;
    
    console.log("Setting up scroll detection after hydration");
    
    // Initial measurements
    setDocumentHeight(document.documentElement.scrollHeight);
    setWindowHeight(window.innerHeight);
    setScrollY(window.scrollY);
    lastScrollY.current = window.scrollY;
    
    // Scroll handler
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrollY(currentY);
      setEventCount(prev => prev + 1);
      console.log("SCROLL EVENT", { scrollY: currentY });
    };
    
    // Set up event listeners
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHydrated]);
  
  // Render 11 full viewport height sections to ensure scrollability
  const sections = Array.from({ length: 11 }).map((_, i) => (
    <div 
      key={i}
      style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: i % 2 === 0 ? '#f0f0f0' : '#e0e0e0',
        fontSize: '5rem',
        fontWeight: 'bold',
        color: '#888'
      }}
    >
      Section {i}
    </div>
  ));
  
  // Progress indicator
  const progressBar = (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '12px',
      backgroundColor: '#333',
      zIndex: 100
    }}>
      {isHydrated && documentHeight > windowHeight && (
        <div style={{
          height: '100%',
          width: `${(scrollY / (documentHeight - windowHeight)) * 100}%`,
          backgroundColor: '#ff0000',
          transition: 'width 0.2s'
        }} />
      )}
    </div>
  );
  
  // Debug info
  const debugInfo = (
    <div style={{
      position: 'fixed',
      top: '40px',
      left: '20px',
      zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: '14px'
    }}>
      <div>Hydrated: {isHydrated ? 'Yes ✅' : 'No ❌'}</div>
      <div>Events detected: {eventCount}</div>
      <div>Scroll Y: {scrollY}px</div>
      <div>Document height: {documentHeight}px</div>
      <div>Window height: {windowHeight}px</div>
      <div>Progress: {documentHeight > windowHeight 
        ? ((scrollY / (documentHeight - windowHeight)) * 100).toFixed(2) 
        : 'N/A'}%
      </div>
    </div>
  );
  
  return (
    <>
      {/* Fixed header banner */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: '15px',
        backgroundColor: 'rgba(255,0,0,0.9)',
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        zIndex: 99
      }}>
        HYDRATION-SAFE TEST
      </div>
      
      {/* Progress bar */}
      {progressBar}
      
      {/* Debug info */}
      {debugInfo}
      
      {/* Scroll test button */}
      <div style={{
        position: 'fixed',
        top: '200px',
        left: '20px',
        zIndex: 100
      }}>
        <button
          onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
          style={{
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Scroll Down 500px
        </button>
      </div>
      
      {/* Scrollable sections */}
      <div style={{ paddingTop: '50px' }}>
        {sections}
      </div>
    </>
  );
} 