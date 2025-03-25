"use client";

import { useState, useEffect } from "react";

export default function StandaloneDebug() {
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    // Force-inject CSS to ensure it's not being overridden
    const style = document.createElement('style');
    style.innerHTML = `
      .progress-container {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 20px !important;
        background-color: #333 !important;
        z-index: 2147483647 !important; /* Maximum possible z-index */
      }
      
      .progress-bar {
        height: 100% !important;
        background-color: #ff0000 !important;
        width: ${progress}% !important;
        transition: width 0.1s ease-out !important;
      }
      
      .toast-message {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        background: #333 !important;
        color: white !important;
        padding: 10px 20px !important;
        border-radius: 4px !important;
        z-index: 2147483647 !important;
        animation: fadeIn 0.3s, fadeOut 0.3s 2.7s !important;
        opacity: 0 !important;
        animation-fill-mode: forwards !important;
      }
      
      @keyframes fadeIn {
        from { opacity: 0 !important; }
        to { opacity: 1 !important; }
      }
      
      @keyframes fadeOut {
        from { opacity: 1 !important; }
        to { opacity: 0 !important; }
      }
      
      .debug-button {
        background-color: #4f46e5 !important;
        color: white !important;
        border: none !important;
        padding: 10px 20px !important;
        font-size: 16px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        margin: 10px 5px !important;
        transform: scale(1) !important;
        transition: transform 0.1s !important;
      }
      
      .debug-button:active {
        transform: scale(0.95) !important;
      }
    `;
    document.head.appendChild(style);
    
    const updateProgress = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = (winScroll / height) * 100;
      setProgress(scrollPercentage);
      
      if (winScroll > 10) {
        setScrolled(true);
      }
    };

    window.addEventListener('scroll', updateProgress);
    
    // Add container for progress bar
    const container = document.createElement('div');
    container.className = 'progress-container';
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    container.appendChild(bar);
    document.body.appendChild(container);
    
    return () => {
      window.removeEventListener('scroll', updateProgress);
      document.body.removeChild(container);
      document.head.removeChild(style);
    };
  }, [progress]);

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', marginTop: '40px' }}>
        Standalone Debug Page
      </h1>
      
      <div style={{ padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px', marginBottom: '20px' }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Progress Indicator:</h2>
        <p>Current progress: {Math.round(progress)}%</p>
        <p>Scrolled: {scrolled ? 'Yes ✅' : 'No ❌'}</p>
        <p><strong>You should see a red bar at the very top of the window.</strong></p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>Button Interactions</h2>
        <button 
          className="debug-button"
          onClick={() => showToast('Button Clicked!')}
        >
          Test Button (Press Me)
        </button>
        
        <button 
          className="debug-button"
          style={{ backgroundColor: '#dc2626' }}
          onClick={() => showToast('Error Message!')}
        >
          Show Toast
        </button>
      </div>
      
      {/* Add lots of scrollable content */}
      <div style={{ marginTop: '30px' }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>Scroll Down</h2>
        <p>Scroll down to see the progress indicator change.</p>
        
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            style={{ 
              height: '200px', 
              backgroundColor: i % 2 === 0 ? '#f5f5f5' : '#e5e5e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              borderRadius: '4px'
            }}
          >
            Scroll Section {i+1}
          </div>
        ))}
      </div>
    </div>
  );
} 