"use client";

import { useState, useEffect, useRef } from "react";

export default function FixedHeightTest() {
  const [eventCount, setEventCount] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [documentHeight, setDocumentHeight] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Wait for Next.js hydration to complete
  useEffect(() => {
    setIsHydrated(true);
    console.log("Component hydrated");
  }, []);
  
  // Set up scroll detection only after hydration
  useEffect(() => {
    if (!isHydrated) return;
    
    console.log("Setting up scroll detection after hydration");
    
    // Force the page to have scrollable content
    const contentContainer = document.getElementById('content-container');
    if (contentContainer) {
      // Force minimum content height to be much larger than viewport
      const minHeight = Math.max(5000, window.innerHeight * 5);
      contentContainer.style.minHeight = `${minHeight}px`;
      console.log(`Forcing content height to ${minHeight}px`);
    }
    
    // Initial measurements (after forcing height)
    setTimeout(() => {
      setDocumentHeight(document.documentElement.scrollHeight);
      setWindowHeight(window.innerHeight);
      setScrollY(window.scrollY);
      console.log("Updated measurements:", {
        scrollHeight: document.documentElement.scrollHeight,
        windowHeight: window.innerHeight,
        difference: document.documentElement.scrollHeight - window.innerHeight
      });
    }, 0);
    
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
  
  // Progress bar - only shown when we have scrollable content
  const progressBar = isHydrated && documentHeight > windowHeight ? (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '15px',
      backgroundColor: '#333',
      zIndex: 10000
    }}>
      <div style={{
        height: '100%',
        width: documentHeight > windowHeight 
          ? `${(scrollY / (documentHeight - windowHeight)) * 100}%` 
          : '0%',
        backgroundColor: '#ff0000',
        transition: 'width 0.2s'
      }} />
    </div>
  ) : null;
  
  // Debug info
  const debugInfo = (
    <div style={{
      position: 'fixed',
      top: '50px',
      left: '20px',
      zIndex: 10000,
      backgroundColor: 'rgba(0,0,0,0.9)',
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
      <div>Difference: {documentHeight - windowHeight}px</div>
      <div>Progress: {documentHeight > windowHeight 
        ? ((scrollY / (documentHeight - windowHeight)) * 100).toFixed(2) 
        : 'N/A'}%
      </div>
    </div>
  );
  
  // Ensure the page has at least this much empty space to scroll
  const minContentHeight = 5000;
  
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
        zIndex: 9999
      }}>
        FIXED HEIGHT TEST - SCROLL DOWN
      </div>
      
      {/* Progress bar */}
      {progressBar}
      
      {/* Debug info */}
      {debugInfo}
      
      {/* Scroll test button */}
      <div style={{
        position: 'fixed',
        top: '225px',
        left: '20px',
        zIndex: 10000
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
          Force Scroll Down 500px
        </button>
      </div>
      
      {/* Content container with fixed minimum height */}
      <div id="content-container" style={{ 
        paddingTop: '300px',
        minHeight: `${minContentHeight}px`, // Initial height, will be overridden
        background: 'linear-gradient(to bottom, #ffffff, #f0f0f0, #e0e0e0, #d0d0d0, #c0c0c0)',
      }}>
        <h1 style={{ 
          fontSize: '3rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '50px'
        }}>
          SCROLL TEST PAGE
        </h1>
        
        {/* Markers to show scrolling */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            style={{ 
              height: '200px', 
              margin: '20px auto',
              maxWidth: '800px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: i % 2 === 0 ? '#f8f9fa' : '#e9ecef',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#888',
              borderRadius: '8px'
            }}
          >
            Section {i + 1} - scroll position marker
          </div>
        ))}
      </div>
    </>
  );
} 