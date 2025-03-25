"use client";

import { useEffect, useRef, useState } from "react";

// This is a minimal page that injects pure JavaScript to detect scroll issues
export default function MinimalDebug() {
  const [logs, setLogs] = useState<string[]>([]);
  const debugLogRef = useRef<HTMLPreElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // Safe logging function
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };
  
  // Scroll to bottom of log when new logs are added
  useEffect(() => {
    if (debugLogRef.current) {
      debugLogRef.current.scrollTop = debugLogRef.current.scrollHeight;
    }
  }, [logs]);

  // Set up environment scanning and scroll progress
  useEffect(() => {
    // Initial environment scanning
    const scanEnvironment = () => {
      const body = document.body;
      const html = document.documentElement;
      
      const bodyStyles = window.getComputedStyle(body);
      const htmlStyles = window.getComputedStyle(html);
      
      const checkOverflow = (styles: CSSStyleDeclaration) => {
        return {
          overflow: styles.overflow,
          overflowX: styles.overflowX,
          overflowY: styles.overflowY,
          height: styles.height,
          position: styles.position
        };
      };
      
      addLog('Environment Info:');
      addLog(`Window: ${window.innerWidth}x${window.innerHeight}`);
      addLog(`Document: ${document.documentElement.scrollWidth}x${document.documentElement.scrollHeight}`);
      addLog(`Body: ${body.scrollWidth}x${body.scrollHeight}`);
      addLog(`HTML styles: ${JSON.stringify(checkOverflow(htmlStyles))}`);
      addLog(`Body styles: ${JSON.stringify(checkOverflow(bodyStyles))}`);
      
      // Check for potential conflicts
      addLog('Checking for potential conflicts:');
      if (window.onscroll) addLog('WARNING: window.onscroll is already defined');
      if (document.onscroll) addLog('WARNING: document.onscroll is already defined');
      
      // Check for elements with fixed position
      const fixedElements = document.querySelectorAll('*[style*="position: fixed"], *[style*="position:fixed"]');
      addLog(`Found ${fixedElements.length} elements with fixed position`);
    };

    // Set up scroll event listener for progress bar
    const handleScroll = () => {
      if (!progressBarRef.current) return;
      
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = scrollTop / (docHeight - winHeight) * 100 || 0;
      
      progressBarRef.current.style.width = `${scrollPercent}%`;
    };

    // Execute environment scan
    scanEnvironment();
    
    // Set up scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Look for scroll handlers already registered
    let capturedHandlers = 0;
    const origAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, handler, options) {
      if (type === 'scroll') {
        capturedHandlers++;
        addLog(`Found scroll handler #${capturedHandlers} on ${this.constructor.name}`);
      }
      return origAddEventListener.call(this, type, handler, options);
    };
    
    // Restore original after a short delay
    setTimeout(() => {
      EventTarget.prototype.addEventListener = origAddEventListener;
      addLog('Scan complete. Original addEventListener restored.');
    }, 2000);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);  // Empty dependency array means run once on mount

  // Animation function for smooth scrolling - moved outside the handler to fix linter error
  const animateScroll = (
    callback: (after: number) => void,
    targetY: number = 500,
    duration: number = 300
  ) => {
    const before = window.scrollY;
    let start: number | null = null;
    
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percent = Math.min(progress / duration, 1);
      
      window.scrollTo(0, percent * targetY);
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        const after = window.scrollY;
        callback(after);
      }
    };
    
    requestAnimationFrame(animate);
    return before;
  };

  // Button handlers
  const handlePlainJsScroll = () => {
    addLog('Attempting plain JS scrollTo...');
    try {
      const before = window.scrollY;
      window.scrollTo(0, 500);
      setTimeout(() => {
        const after = window.scrollY;
        addLog(`ScrollTo: Before=${before}, After=${after}, Changed=${after !== before}`);
      }, 100);
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
    }
  };
  
  const handleMeasureOnly = () => {
    addLog('Measuring scroll metrics...');
    const win = {
      scrollY: window.scrollY,
      pageYOffset: window.pageYOffset,
      innerHeight: window.innerHeight
    };
    const doc = {
      scrollTop: document.documentElement.scrollTop,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight
    };
    const body = {
      scrollTop: document.body.scrollTop,
      scrollHeight: document.body.scrollHeight
    };
    addLog(`Window: ${JSON.stringify(win)}`);
    addLog(`Document: ${JSON.stringify(doc)}`);
    addLog(`Body: ${JSON.stringify(body)}`);
  };
  
  const handleAlternateScroll = () => {
    addLog('Trying alternate scroll method...');
    try {
      const before = animateScroll((after) => {
        addLog(`Alternate Scroll: Before=${before}, After=${after}, Changed=${after !== before}`);
      });
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
    }
  };
  
  const handleDirectDom = () => {
    addLog('Attempting direct DOM manipulation...');
    try {
      // Create visual overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      
      const message = document.createElement('div');
      message.style.backgroundColor = 'white';
      message.style.padding = '20px';
      message.style.borderRadius = '8px';
      message.textContent = 'Direct DOM test active. Click to dismiss.';
      
      overlay.appendChild(message);
      document.body.appendChild(overlay);
      
      // Try to scroll
      window.scrollTo(0, 500);
      
      // Remove on click
      overlay.addEventListener('click', () => {
        document.body.removeChild(overlay);
        addLog('Direct DOM test complete');
      });
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-8 bg-red-600 z-[9999]" 
           ref={progressBarRef} 
           style={{ width: '0%' }}
      />
    
      <div id="content" className="p-8 pt-16">
        <h1 className="text-3xl font-bold mb-6">Minimal Debug Page (Fixed)</h1>
        <p className="mb-4">This page uses proper client-side React patterns to avoid hydration errors.</p>
        
        <div className="space-y-4">
          <button 
            onClick={handlePlainJsScroll}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Plain JS ScrollTo
          </button>
          
          <button 
            onClick={handleMeasureOnly}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Measure Scroll Only (No Action)
          </button>
          
          <button 
            onClick={handleAlternateScroll}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Alternate Scroll Method
          </button>
          
          <button 
            onClick={handleDirectDom}
            className="px-4 py-2 bg-amber-600 text-white rounded"
          >
            Direct DOM Manipulation
          </button>
        </div>
        
        <div className="mt-8 p-4 border border-gray-200 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Debug Log:</h2>
          <pre 
            ref={debugLogRef}
            className="whitespace-pre-wrap bg-gray-900 text-green-400 p-4 rounded h-48 overflow-auto"
          >
            {logs.join('\n')}
          </pre>
        </div>
        
        <div className="my-8 h-96 bg-blue-50 flex items-center justify-center">
          Scroll Target Area
        </div>
        
        {/* Add some content to ensure scrollability */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="my-8 h-80 bg-gray-100 flex items-center justify-center">
            Scroll Section {i + 1}
          </div>
        ))}
      </div>
    </>
  );
} 