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
      localStorage.getItem('pwaStandalone') === 'true' ||
      sessionStorage.getItem('iosStandaloneSession') === 'true';
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
      
      // If we're on an entry point or the root page, redirect to dashboard
      if (window.location.pathname === '/' || 
          window.location.pathname === '/index.html' || 
          window.location.pathname === '/index-ios.html' ||
          window.location.pathname === '/index-pwa.html') {
        console.log('[PWA] Redirecting entry point to dashboard');
        window.location.replace('/dashboard');
      }
    } else {
      document.documentElement.classList.add('browser-mode');
      console.log('[PWA] Running in browser mode');
      
      // When navigating to the app in browser mode on iOS, 
      // save current URL for post-installation redirect
      if (isIOS() && !isInStandaloneMode()) {
        // Save current URL unless we're on special pages
        if (!window.location.pathname.includes('redirect') && 
            !window.location.pathname.includes('index-ios')) {
          sessionStorage.setItem('pwaRedirectUrl', window.location.pathname + window.location.search);
          console.log('[PWA] Saved URL for post-install:', window.location.pathname + window.location.search);
        }
      }
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
  
  // Handle redirection when in standalone mode
  function handleStandaloneRedirects() {
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
          return true; // Indicate that a redirect is happening
        }
      }
    }
    return false; // No redirect happened
  }
  
  // Run the standalone check when DOM is ready
  function initialize() {
    const isStandalone = checkStandaloneStatus();
    
    // Only proceed with further checks if no redirect happened
    if (!handleStandaloneRedirects() && isStandalone && isIOS()) {
      console.log('[PWA] Setup complete for iOS standalone mode');
      
      // Additional iOS tweaks can go here
      
      // Fix iOS safe area insets for notched devices
      document.body.style.paddingTop = 'env(safe-area-inset-top)';
      document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
      document.body.style.paddingLeft = 'env(safe-area-inset-left)';
      document.body.style.paddingRight = 'env(safe-area-inset-right)';
    }
  }
  
  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Expose utilities for other scripts
  window.pwaUtils = {
    isIOS: isIOS,
    isStandalone: isInStandaloneMode,
    checkStandaloneStatus: checkStandaloneStatus
  };
})();

/***********************************************
 * MYFC PWA Standalone Mode Enhancement
 * This script enhances the iOS standalone mode experience
 ***********************************************/

// Utility functions
function isMembersSubdomain() {
  return window.location.hostname === 'members.myfc.app';
}

function isIOSStandalone() {
  return window.navigator.standalone === true;
}

function isAndroidStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches;
}

function isStandalone() {
  return isIOSStandalone() || isAndroidStandalone();
}

// Log environment details
console.log('[Standalone.js] Current URL:', window.location.href);
console.log('[Standalone.js] Hostname:', window.location.hostname);
console.log('[Standalone.js] Is members subdomain:', isMembersSubdomain());
console.log('[Standalone.js] iOS standalone:', isIOSStandalone());
console.log('[Standalone.js] Android standalone:', isAndroidStandalone());

// Store standalone status in localStorage for other scripts
if (isStandalone()) {
  console.log('[Standalone.js] Running in standalone mode');
  localStorage.setItem('pwaStandalone', 'true');
  
  // Redirect to dashboard if on root path
  if (window.location.pathname === '/' || window.location.pathname.includes('index')) {
    console.log('[Standalone.js] Redirecting to dashboard from root'); 
    window.location.replace('./dashboard');
  }
}

// Handle external links in standalone mode
document.addEventListener('click', function(event) {
  // Only process in standalone mode
  if (!isStandalone()) return;
  
  let target = event.target;
  
  // Find closest anchor if clicked on a child element
  while (target && target.tagName !== 'A') {
    target = target.parentElement;
    if (!target) return;
  }
  
  if (target && target.tagName === 'A') {
    const href = target.getAttribute('href');
    if (!href) return;
    
    try {
      const url = new URL(href, window.location.href);
      
      // If it's an external link or has target="_blank"
      if (url.hostname !== window.location.hostname || target.getAttribute('target') === '_blank') {
        console.log('[Standalone.js] Opening external link in system browser:', url.href);
        
        // Open in system browser
        window.open(url.href, '_system');
        
        // Prevent default navigation
        event.preventDefault();
      }
    } catch (e) {
      console.error('[Standalone.js] Error processing link:', e);
    }
  }
});

// Register service worker if not already registered
if ('serviceWorker' in navigator) {
  // Check if we're on the members.myfc.app subdomain
  const hostname = window.location.hostname;
  const isMembersSubdomain = hostname === 'members.myfc.app';
  
  // Choose appropriate service worker path and scope
  const swPath = isMembersSubdomain ? './sw.js' : '/sw.js';
  const swScope = isMembersSubdomain ? './' : '/';
  
  console.log(`[Standalone.js] Will register service worker from ${swPath} with scope ${swScope}`);
  
  window.addEventListener('load', function() {
    navigator.serviceWorker.register(swPath, {
      scope: swScope
    }).then(function(registration) {
      console.log('[Standalone.js] Service worker registered successfully:', registration.scope);
    }).catch(function(error) {
      console.error('[Standalone.js] Service worker registration failed:', error);
    });
  });
} 