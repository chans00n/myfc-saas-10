/**
 * Standalone mode detection and fixes for iOS
 * This script helps ensure proper PWA behavior on iOS devices
 */

(function() {
  // Helper function to check if we're on iOS
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }
  
  // Helper function to check if app is in standalone mode (installed to home screen)
  function isInStandaloneMode() {
    return window.navigator.standalone || 
      window.matchMedia('(display-mode: standalone)').matches ||
      localStorage.getItem('pwaStandalone') === 'true';
  }
  
  // Check and set standalone status
  function checkStandaloneStatus() {
    const standalone = isInStandaloneMode();
    
    // Add class to body if in standalone mode
    if (standalone) {
      document.documentElement.classList.add('standalone-mode');
      localStorage.setItem('pwaStandalone', 'true');
      
      // Log for debugging
      console.log('[PWA] Running in standalone mode');
      
      // Fix for broken navigation in iOS standalone
      if (isIOS()) {
        fixIOSStandaloneLinks();
      }
    } else {
      document.documentElement.classList.add('browser-mode');
      console.log('[PWA] Running in browser mode');
    }
    
    return standalone;
  }
  
  // Fix for iOS standalone mode links
  function fixIOSStandaloneLinks() {
    // Handle clicks on all _blank links to prevent them from breaking out of PWA
    document.addEventListener('click', function(e) {
      // Find closest anchor tag
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      
      if (!target) return;
      
      // If it's an external link or has _blank target
      if (target.target === '_blank' || 
          (target.href && target.origin !== window.location.origin)) {
        e.preventDefault();
        
        // Open in system browser instead
        window.open(target.href);
      }
    });
    
    // Handle back navigation for history
    let lastPageY = 0;
    
    // Store position on page load and restore
    window.addEventListener('load', function() {
      // Try to restore scroll position
      if (window.history.scrollRestoration) {
        window.history.scrollRestoration = 'manual';
      }
      
      const storedY = sessionStorage.getItem('lastPageY');
      if (storedY) {
        window.scrollTo(0, parseInt(storedY, 10));
        sessionStorage.removeItem('lastPageY');
      }
    });
    
    // Store position on page unload
    window.addEventListener('beforeunload', function() {
      sessionStorage.setItem('lastPageY', window.pageYOffset.toString());
    });
    
    // Add PWA detection flag for server
    const httpReq = new XMLHttpRequest();
    httpReq.open('GET', '/api/pwa-headers', true);
    httpReq.setRequestHeader('X-PWA-Standalone', 'true');
    httpReq.send();
  }
  
  // URLs to remember after installation
  function handleUrlRedirects() {
    if (isIOS() && !isInStandaloneMode()) {
      // Save current URL unless we're on special pages
      if (!window.location.pathname.includes('ios-redirect') && 
          !window.location.pathname.includes('index-ios')) {
        sessionStorage.setItem('pwaRedirectUrl', window.location.pathname + window.location.search);
      }
    }
    
    // If we're in standalone mode and there's a saved URL, redirect to it
    if (isInStandaloneMode()) {
      const savedUrl = sessionStorage.getItem('pwaRedirectUrl');
      if (savedUrl) {
        console.log('[PWA] Redirecting to saved URL:', savedUrl);
        
        // Remove the stored URL to prevent redirect loops
        sessionStorage.removeItem('pwaRedirectUrl');
        
        // Only redirect if we're not already on that URL
        if (savedUrl !== window.location.pathname + window.location.search) {
          window.location.replace(savedUrl);
        }
      }
    }
  }
  
  // Run the standalone check when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      checkStandaloneStatus();
      handleUrlRedirects();
    });
  } else {
    checkStandaloneStatus();
    handleUrlRedirects();
  }
  
  // Expose utilities for other scripts
  window.pwaUtils = {
    isIOS: isIOS,
    isStandalone: isInStandaloneMode,
    checkStandaloneStatus: checkStandaloneStatus
  };
})(); 