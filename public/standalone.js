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

// MYFC PWA Standalone Mode Helper

// Detect if running on the members subdomain
function isMembersSubdomain() {
  return window.location.hostname === 'members.myfc.app';
}

// Detect iOS standalone mode (added to home screen)
function isIOSStandalone() {
  return window.navigator.standalone === true;
}

// Detect Android standalone mode (added to home screen)
function isAndroidStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches;
}

// Combined standalone detection
function isStandalone() {
  return isIOSStandalone() || isAndroidStandalone();
}

// Log current environment details
console.log('[MYFC] Environment info:');
console.log('- URL:', window.location.href);
console.log('- Hostname:', window.location.hostname);
console.log('- Is members subdomain:', isMembersSubdomain());
console.log('- Is iOS standalone:', isIOSStandalone());
console.log('- Is Android standalone:', isAndroidStandalone());
console.log('- Is standalone:', isStandalone());

// Store standalone status in localStorage for other scripts to use
if (isStandalone()) {
  localStorage.setItem('pwaStandalone', 'true');
  
  // If on root path, redirect to dashboard (using relative path for subdomain compatibility)
  if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    console.log('[MYFC] Redirecting from root to dashboard in standalone mode');
    window.location.replace('./dashboard');
  }
}

// Handle external links in standalone mode
document.addEventListener('click', function(event) {
  // Only handle clicks in standalone mode
  if (!isStandalone()) return;
  
  let target = event.target;
  
  // Find the closest anchor tag
  while (target && target.tagName !== 'A') {
    target = target.parentElement;
  }
  
  // If we found an anchor tag
  if (target && target.tagName === 'A') {
    const href = target.getAttribute('href');
    const target_type = target.getAttribute('target');
    
    // Skip if no href or it's a hash link
    if (!href || href.startsWith('#')) return;
    
    // Handle external links
    if (
      href.startsWith('http') && 
      !href.includes(window.location.hostname)
    ) {
      console.log('[MYFC] Opening external link in system browser:', href);
      window.open(href, '_system');
      event.preventDefault();
    }
    // Handle target="_blank" links
    else if (target_type === '_blank') {
      console.log('[MYFC] Opening _blank link in system browser:', href);
      window.open(href, '_system');
      event.preventDefault();
    }
  }
});

// Register the service worker if not already registered
if ('serviceWorker' in navigator) {
  const swPath = './sw.js';
  navigator.serviceWorker.register(swPath, { scope: './' })
    .then(registration => {
      console.log('[MYFC] Service worker registered with scope:', registration.scope);
    })
    .catch(error => {
      console.error('[MYFC] Service worker registration failed:', error);
    });
} 