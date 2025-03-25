"use client";

import { useState, useEffect } from "react";

export default function BasicTest() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Force the page to be much taller than the viewport
    const content = document.createElement('div');
    content.style.height = '5000px'; // Super tall content
    content.style.background = 'linear-gradient(to bottom, #ffffff, #e0e0e0)';
    content.style.position = 'relative';
    content.style.zIndex = '1';
    document.body.appendChild(content);
    
    // Create fixed header with progress bar
    const header = document.createElement('div');
    header.style.position = 'fixed';
    header.style.top = '0';
    header.style.left = '0';
    header.style.width = '100%';
    header.style.height = '20px';
    header.style.backgroundColor = '#333';
    header.style.zIndex = '9999999';
    
    const progressBar = document.createElement('div');
    progressBar.style.height = '100%';
    progressBar.style.width = '0%';
    progressBar.style.backgroundColor = '#ff0000';
    progressBar.style.transition = 'width 0.2s';
    header.appendChild(progressBar);
    
    document.body.appendChild(header);
    
    console.log("Created elements:", { content, header, progressBar });
    console.log("Body height:", document.body.scrollHeight);
    console.log("Window height:", window.innerHeight);
    
    // Scroll handler
    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      console.log("Scroll event:", {
        scrollTop,
        scrollHeight,
        clientHeight,
        diff: scrollHeight - clientHeight
      });
      
      // Calculate progress percentage
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight) * 100;
      progressBar.style.width = `${scrollPercentage}%`;
      setProgress(scrollPercentage);
    };
    
    // Add scroll listener
    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial call
    
    // Create status indicator in bottom left
    const statusBox = document.createElement('div');
    statusBox.style.position = 'fixed';
    statusBox.style.bottom = '10px';
    statusBox.style.left = '10px';
    statusBox.style.backgroundColor = '#ff00ff';
    statusBox.style.color = 'white';
    statusBox.style.padding = '10px';
    statusBox.style.borderRadius = '4px';
    statusBox.style.zIndex = '9999999';
    statusBox.style.fontSize = '14px';
    statusBox.style.fontFamily = 'monospace';
    document.body.appendChild(statusBox);
    
    // Update status box with scroll info
    const updateStatus = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight) * 100).toFixed(2);
      
      statusBox.innerHTML = `
        Scroll: ${scrollTop}px<br>
        Progress: ${scrollPercentage}%<br>
        Content: ${scrollHeight}px<br>
        Window: ${clientHeight}px
      `;
    };
    
    // Update status on scroll and periodically
    window.addEventListener('scroll', updateStatus);
    const statusInterval = setInterval(updateStatus, 500);
    updateStatus(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('scroll', updateStatus);
      clearInterval(statusInterval);
      document.body.removeChild(content);
      document.body.removeChild(header);
      document.body.removeChild(statusBox);
    };
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      top: '40px',
      left: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      zIndex: 9999998
    }}>
      <h1 style={{ fontSize: '18px', marginBottom: '10px' }}>
        Basic Scroll Test
      </h1>
      <p>This page creates a very tall content area (5000px) and a fixed header with progress bar</p>
      <p>Current progress: {progress.toFixed(2)}%</p>
      <p>The red progress bar should appear at the very top of the page.</p>
      <p>The pink status box in the bottom-left corner shows scroll metrics.</p>
      <button
        onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })}
        style={{
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '4px',
          marginTop: '10px',
          cursor: 'pointer'
        }}
      >
        Scroll Down 1000px
      </button>
    </div>
  );
} 