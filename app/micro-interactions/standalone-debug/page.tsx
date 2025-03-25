"use client";

import { useState, useEffect, useRef } from "react";

export default function StandaloneDebug() {
  const [scrollY, setScrollY] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [documentHeight, setDocumentHeight] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scrollMethod, setScrollMethod] = useState("Not detected");
  const [errorMessage, setErrorMessage] = useState("");
  const debugInterval = useRef<any>(null);
  
  useEffect(() => {
    // Try to log debug info to help diagnose the issue
    console.log("Debug page mounted");
    
    try {
      // Capture initial dimensions
      const updateDimensions = () => {
        try {
          setWindowHeight(window.innerHeight);
          setDocumentHeight(document.documentElement.scrollHeight);

          // Try different scroll position methods
          const scrollTop1 = window.pageYOffset;
          const scrollTop2 = document.documentElement.scrollTop;
          const scrollTop3 = document.body.scrollTop;
          
          let activeMethod = "None working";
          let scrollPosition = 0;
          
          if (scrollTop1 > 0) {
            activeMethod = "window.pageYOffset";
            scrollPosition = scrollTop1;
          } else if (scrollTop2 > 0) {
            activeMethod = "documentElement.scrollTop";
            scrollPosition = scrollTop2;
          } else if (scrollTop3 > 0) {
            activeMethod = "body.scrollTop";
            scrollPosition = scrollTop3;
          } else {
            // Use any value, even if 0
            activeMethod = "Using window.pageYOffset (default)";
            scrollPosition = scrollTop1;
          }
          
          setScrollMethod(activeMethod);
          setScrollY(scrollPosition);
          
          // Calculate progress
          const height = document.documentElement.scrollHeight - window.innerHeight;
          const calcProgress = height > 0 ? (scrollPosition / height) * 100 : 0;
          setProgress(Math.min(100, Math.max(0, calcProgress)));
          
          console.log("Scroll debug:", { 
            position: scrollPosition, 
            windowHeight: window.innerHeight,
            documentHeight: document.documentElement.scrollHeight,
            method: activeMethod,
            progress: calcProgress
          });
        } catch (err: any) {
          console.error("Error updating dimensions:", err);
          setErrorMessage(err.message || "Unknown error updating dimensions");
        }
      };
      
      // Update immediately and then on events
      updateDimensions();
      
      // Set up multiple ways to detect scrolling
      window.addEventListener('scroll', updateDimensions);
      window.addEventListener('resize', updateDimensions);
      
      // Backup polling method in case events don't fire
      debugInterval.current = setInterval(updateDimensions, 500);
      
      // Create test element to show we can manipulate DOM
      const testEl = document.createElement('div');
      testEl.style.position = 'fixed';
      testEl.style.bottom = '10px';
      testEl.style.left = '10px';
      testEl.style.background = '#ff00ff';
      testEl.style.color = 'white';
      testEl.style.padding = '5px';
      testEl.style.zIndex = '2147483647';
      testEl.style.fontSize = '12px';
      testEl.textContent = 'DOM Test Element';
      document.body.appendChild(testEl);
      
      return () => {
        window.removeEventListener('scroll', updateDimensions);
        window.removeEventListener('resize', updateDimensions);
        if (debugInterval.current) clearInterval(debugInterval.current);
        if (document.body.contains(testEl)) document.body.removeChild(testEl);
      };
    } catch (err: any) {
      console.error("Critical setup error:", err);
      setErrorMessage(`Critical error: ${err.message || "Unknown setup error"}`);
      return () => {};
    }
  }, []);
  
  const forceScroll = () => {
    try {
      window.scrollTo({
        top: 100, 
        behavior: 'smooth'
      });
    } catch (err: any) {
      setErrorMessage(`Scroll error: ${err.message || "Unknown scroll error"}`);
    }
  };

  const resetScroll = () => {
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } catch (err: any) {
      setErrorMessage(`Reset error: ${err.message || "Unknown reset error"}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', marginTop: '40px' }}>
        Advanced Scroll Debugging
      </h1>
      
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8d7da', 
        border: '1px solid #f5c6cb', 
        borderRadius: '4px', 
        marginBottom: '20px',
        fontSize: '14px',
        fontFamily: 'monospace'
      }}>
        <p><strong>Raw Scroll Values:</strong></p>
        <pre style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}>
          {`Window Height: ${windowHeight}px
Document Height: ${documentHeight}px
Current Scroll Y: ${scrollY}px
Scroll Progress: ${progress.toFixed(2)}%
Active Method: ${scrollMethod}
${errorMessage ? `ERROR: ${errorMessage}` : ''}`}
        </pre>
        
        <div style={{ marginTop: '15px' }}>
          <button
            onClick={forceScroll}
            style={{ 
              background: '#4f46e5', 
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            Force Scroll Down 100px
          </button>
          
          <button
            onClick={resetScroll}
            style={{ 
              background: '#6c757d', 
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '4px'
            }}
          >
            Reset Scroll
          </button>
        </div>
      </div>
      
      <div style={{ 
        height: '20px', 
        width: '100%', 
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${progress}%`, 
            backgroundColor: '#ff0000',
            transition: 'width 0.2s'
          }} 
        />
      </div>
      
      <p style={{ marginBottom: '20px' }}>
        This page shows the raw scroll values and creates a visual progress bar.
        If scrolling isn't detected, try the "Force Scroll" button.
        <br /><br />
        <strong>Check the browser console (F12) for additional debug information.</strong>
      </p>
      
      {/* Add lots of scrollable content */}
      <div style={{ marginTop: '30px' }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>Scroll Content</h2>
        
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            style={{ 
              height: '200px', 
              backgroundColor: i % 2 === 0 ? '#f8f9fa' : '#e9ecef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              borderRadius: '4px',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#6c757d'
            }}
          >
            Section {i+1}
          </div>
        ))}
      </div>
    </div>
  );
} 