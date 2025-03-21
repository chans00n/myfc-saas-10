// Check if running in standalone mode
(function() {
  if (window.navigator.standalone) {
    document.documentElement.classList.add('standalone-mode');
    
    // Prevent navigation to external URLs from opening in the same window
    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentNode;
      }
      
      if (target && target.tagName === 'A' && target.getAttribute('target') !== '_blank') {
        var url = target.getAttribute('href');
        if (url && url.indexOf('://') > -1 && url.indexOf(window.location.hostname) === -1) {
          e.preventDefault();
          window.open(url, '_blank');
        }
      }
    }, false);
    
    // Set status bar color
    var metaTag = document.createElement('meta');
    metaTag.name = "apple-mobile-web-app-status-bar-style";
    metaTag.content = "default";
    document.getElementsByTagName('head')[0].appendChild(metaTag);
  }
})(); 