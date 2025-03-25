"use client";

// This is a minimal page that injects pure JavaScript to detect scroll issues
export default function MinimalDebug() {
  return (
    <>
      <div id="content" className="p-8">
        <h1 className="text-3xl font-bold mb-6">Minimal Debug Page</h1>
        <p className="mb-4">This page isolates potential scrolling conflicts by avoiding React hooks and components.</p>
        
        <div className="space-y-4">
          <button id="btn-plain-js" className="px-4 py-2 bg-blue-600 text-white rounded">
            Plain JS ScrollTo
          </button>
          
          <button id="btn-measure-only" className="px-4 py-2 bg-green-600 text-white rounded">
            Measure Scroll Only (No Action)
          </button>
          
          <button id="btn-alternate" className="px-4 py-2 bg-purple-600 text-white rounded">
            Alternate Scroll Method
          </button>
          
          <button id="btn-direct-dom" className="px-4 py-2 bg-amber-600 text-white rounded">
            Direct DOM Manipulation
          </button>
        </div>
        
        <div className="mt-8 p-4 border border-gray-200 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Debug Log:</h2>
          <pre id="debug-log" className="whitespace-pre-wrap bg-gray-900 text-green-400 p-4 rounded h-48 overflow-auto"></pre>
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
      
      <script dangerouslySetInnerHTML={{ __html: `
        // Direct DOM script to bypass React and Next.js

        // Debug logging helper
        const log = (message) => {
          const logElement = document.getElementById('debug-log');
          if (logElement) {
            const timestamp = new Date().toLocaleTimeString();
            logElement.innerHTML += \`[\${timestamp}] \${message}\\n\`;
            logElement.scrollTop = logElement.scrollHeight;
          }
          console.log(message);
        };

        // Log environment info
        document.addEventListener('DOMContentLoaded', () => {
          const body = document.body;
          const html = document.documentElement;
          
          const bodyStyles = window.getComputedStyle(body);
          const htmlStyles = window.getComputedStyle(html);
          
          const checkOverflow = (element, styles) => {
            return {
              overflow: styles.overflow,
              overflowX: styles.overflowX,
              overflowY: styles.overflowY,
              height: styles.height,
              position: styles.position
            };
          };
          
          log('Environment Info:');
          log(\`Window: \${window.innerWidth}x\${window.innerHeight}\`);
          log(\`Document: \${document.documentElement.scrollWidth}x\${document.documentElement.scrollHeight}\`);
          log(\`Body: \${body.scrollWidth}x\${body.scrollHeight}\`);
          log(\`HTML styles: \${JSON.stringify(checkOverflow(html, htmlStyles))}\`);
          log(\`Body styles: \${JSON.stringify(checkOverflow(body, bodyStyles))}\`);
          
          // Check for potential conflicts
          log('Checking for potential conflicts:');
          if (window.onscroll) log('WARNING: window.onscroll is already defined');
          if (document.onscroll) log('WARNING: document.onscroll is already defined');
          
          // Look for scroll event handlers
          let scrollHandlers = 0;
          const origAddEventListener = EventTarget.prototype.addEventListener;
          EventTarget.prototype.addEventListener = function(type, handler, options) {
            if (type === 'scroll') {
              scrollHandlers++;
              log(\`Found scroll handler #\${scrollHandlers} on \${this.constructor.name}\`);
            }
            return origAddEventListener.call(this, type, handler, options);
          };
          
          // Check for elements with fixed position
          const fixedElements = document.querySelectorAll('*[style*="position: fixed"], *[style*="position:fixed"]');
          log(\`Found \${fixedElements.length} elements with fixed position\`);
          
          // Restore original addEventListener after scan
          setTimeout(() => {
            EventTarget.prototype.addEventListener = origAddEventListener;
            log('Scan complete. Original addEventListener restored.');
          }, 2000);
        });

        // Set up button handlers
        window.addEventListener('load', () => {
          // Plain JS ScrollTo
          document.getElementById('btn-plain-js').addEventListener('click', () => {
            log('Attempting plain JS scrollTo...');
            try {
              const before = window.scrollY;
              window.scrollTo(0, 500);
              setTimeout(() => {
                const after = window.scrollY;
                log(\`ScrollTo: Before=\${before}, After=\${after}, Changed=\${after !== before}\`);
              }, 100);
            } catch (err) {
              log(\`Error: \${err.message}\`);
            }
          });
          
          // Measure only
          document.getElementById('btn-measure-only').addEventListener('click', () => {
            log('Measuring scroll metrics...');
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
            log(\`Window: \${JSON.stringify(win)}\`);
            log(\`Document: \${JSON.stringify(doc)}\`);
            log(\`Body: \${JSON.stringify(body)}\`);
          });
          
          // Alternate scroll method
          document.getElementById('btn-alternate').addEventListener('click', () => {
            log('Trying alternate scroll method...');
            try {
              const before = window.scrollY;
              
              // Force scroll using requestAnimationFrame
              let start = null;
              const targetY = 500;
              const duration = 300;
              
              function animate(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const percent = Math.min(progress / duration, 1);
                
                window.scrollTo(0, percent * targetY);
                
                if (progress < duration) {
                  requestAnimationFrame(animate);
                } else {
                  const after = window.scrollY;
                  log(\`Alternate Scroll: Before=\${before}, After=\${after}, Changed=\${after !== before}\`);
                }
              }
              
              requestAnimationFrame(animate);
            } catch (err) {
              log(\`Error: \${err.message}\`);
            }
          });
          
          // Direct DOM manipulation
          document.getElementById('btn-direct-dom').addEventListener('click', () => {
            log('Attempting direct DOM manipulation...');
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
                log('Direct DOM test complete');
              });
            } catch (err) {
              log(\`Error: \${err.message}\`);
            }
          });
        });
      ` }} />
      
      {/* CSS to ensure the progress bar is visible */}
      <style dangerouslySetInnerHTML={{ __html: `
        #progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 8px;
          background-color: red;
          z-index: 9999;
          transition: width 0.3s;
        }
      ` }} />
      
      {/* Pure JS progress bar */}
      <div id="progress-bar"></div>
      <script dangerouslySetInnerHTML={{ __html: `
        // Create scroll progress bar independent of React
        window.addEventListener('scroll', () => {
          const docHeight = document.documentElement.scrollHeight;
          const winHeight = window.innerHeight;
          const scrollTop = window.scrollY;
          const scrollPercent = scrollTop / (docHeight - winHeight) * 100 || 0;
          
          const progressBar = document.getElementById('progress-bar');
          if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
          }
        });
      ` }} />
    </>
  );
} 