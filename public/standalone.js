// Standalone mode detection for PWA
(function() {
  // Detect if the app is in standalone mode (installed to home screen)
  window.isInStandaloneMode = function() {
    return (
      // iOS detection
      window.navigator.standalone || 
      // Other browser detection
      window.matchMedia('(display-mode: standalone)').matches ||
      // Fallback detection via localStorage
      localStorage.getItem('pwaStandalone') === 'true'
    );
  };

  // Mark as standalone in localStorage if needed (to persist across page reloads)
  if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
    localStorage.setItem('pwaStandalone', 'true');
  }
  
  // Check if we need to redirect on iOS
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isStandalone = window.isInStandaloneMode();
  
  // If on iOS and in standalone mode, handle any saved redirect
  if (isIOS && isStandalone) {
    // Get any saved redirect URL
    const savedUrl = sessionStorage.getItem('pwaRedirectUrl');
    if (savedUrl && window.location.pathname !== savedUrl) {
      // Clear the saved URL first to avoid redirect loops
      sessionStorage.removeItem('pwaRedirectUrl');
      // Redirect to the saved URL
      window.location.replace(savedUrl);
    }
  }
  
  // Add CSS class to body for styling based on standalone mode
  document.addEventListener('DOMContentLoaded', function() {
    if (window.isInStandaloneMode()) {
      document.body.classList.add('standalone-mode');
      
      // iOS specific fixes
      if (isIOS) {
        // Add safe area insets padding to the body
        document.body.style.paddingTop = 'env(safe-area-inset-top)';
        document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
        document.body.style.paddingLeft = 'env(safe-area-inset-left)';
        document.body.style.paddingRight = 'env(safe-area-inset-right)';
      }
    }
  });
})(); 