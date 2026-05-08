/**
 * Cache control utilities to prevent browser caching of authenticated pages
 */

/**
 * Set cache control headers to prevent caching
 */
export const preventCaching = () => {
  // Set meta tags to prevent caching
  const metaTags = [
    { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
    { httpEquiv: 'Pragma', content: 'no-cache' },
    { httpEquiv: 'Expires', content: '0' }
  ];

  metaTags.forEach(tag => {
    let meta = document.querySelector(`meta[http-equiv="${tag.httpEquiv}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.httpEquiv = tag.httpEquiv;
      document.head.appendChild(meta);
    }
    meta.content = tag.content;
  });
};

/**
 * Clear browser history and prevent back navigation
 */
export const clearHistoryAndPreventBack = () => {
  // Push a new state to replace the current one
  window.history.pushState(null, '', window.location.href);
  
  // Listen for popstate events (back button)
  const handlePopState = (event) => {
    event.preventDefault();
    // Push state again to prevent going back
    window.history.pushState(null, '', window.location.href);
    console.log('CacheControl - Back button navigation blocked');
  };
  
  window.addEventListener('popstate', handlePopState);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
};

/**
 * Force page reload on back navigation
 */
export const forceReloadOnBack = () => {
  window.addEventListener('pageshow', (event) => {
    // If page is shown from cache (back button), force reload
    if (event.persisted) {
      console.log('CacheControl - Page loaded from cache, forcing reload');
      window.location.reload();
    }
  });
};
