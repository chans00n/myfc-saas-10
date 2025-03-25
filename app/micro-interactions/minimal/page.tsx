"use client";

export default function MinimalTest() {
  return (
    <div>
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        padding: '10px',
        background: 'rgba(255,0,0,0.9)',
        color: 'white',
        zIndex: 10000,
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        SCROLL DOWN (check browser console)
      </div>
      
      <div
        id="debugOutput"
        style={{
          position: 'fixed',
          top: '50px',
          left: '20px',
          zIndex: 10000,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          maxWidth: '80%',
          overflowWrap: 'break-word'
        }}
      >
        Waiting for scroll events...
      </div>
      
      <div style={{ height: '100vh' }}>
        <h1 style={{ textAlign: 'center', paddingTop: '40vh' }}>Start scrolling</h1>
      </div>
      
      {Array.from({ length: 10 }).map((_, i) => (
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
          Section {i + 1}
        </div>
      ))}
      
      <script dangerouslySetInnerHTML={{ __html: `
        // Force this code to run in the client browser context
        console.log("Scroll test script loaded");
        
        let eventCounter = 0;
        let lastScrollY = window.scrollY;
        const output = document.getElementById('debugOutput');
        
        // Display initial state
        updateDebugOutput();
        
        // Set up all possible ways to detect scroll
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('scroll', handleScroll);
        window.onscroll = handleScroll;
        
        // Also try a polling approach
        setInterval(checkScroll, 500);
        
        function handleScroll(e) {
          eventCounter++;
          console.log("SCROLL EVENT DETECTED!", { 
            counter: eventCounter,
            scrollY: window.scrollY,
            pageYOffset: window.pageYOffset,
            type: e?.type || 'interval',
            timestamp: new Date().toISOString()
          });
          
          updateDebugOutput();
        }
        
        function checkScroll() {
          if (window.scrollY !== lastScrollY) {
            console.log("Scroll position changed via polling");
            lastScrollY = window.scrollY;
            updateDebugOutput();
          }
        }
        
        function updateDebugOutput() {
          if (output) {
            output.innerHTML = \`
              <div>Events detected: \${eventCounter}</div>
              <div>window.scrollY: \${window.scrollY}</div>
              <div>window.pageYOffset: \${window.pageYOffset}</div>
              <div>document.documentElement.scrollTop: \${document.documentElement.scrollTop}</div>
              <div>document.body.scrollTop: \${document.body.scrollTop}</div>
              <div>window.innerHeight: \${window.innerHeight}</div>
              <div>document.documentElement.scrollHeight: \${document.documentElement.scrollHeight}</div>
            \`;
          } else {
            console.error("Debug output element not found");
          }
        }
      ` }}></script>
    </div>
  );
} 