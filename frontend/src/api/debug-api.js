// API Debug Script
// Run this in browser console when testing the app

(function() {
  const originalFetch = window.fetch;
  
  // Override fetch to log all API requests
  window.fetch = function(url, options) {
    const isApiCall = url.includes('fianceapi');
    const startTime = Date.now();
    const reqId = Math.random().toString(36).substring(2, 10);
    
    if (isApiCall) {
      console.log(`%c[API Request ${reqId}]`, 'color: blue; font-weight: bold', {
        url,
        method: options?.method || 'GET',
        headers: options?.headers,
        body: options?.body ? JSON.parse(options.body) : undefined,
        timestamp: new Date().toISOString()
      });
    }
    
    return originalFetch(url, options)
      .then(response => {
        // Clone the response so we can read the body while still returning the original
        const clone = response.clone();
        
        if (isApiCall) {
          const duration = Date.now() - startTime;
          
          // Log the response status
          console.log(`%c[API Response ${reqId}]`, 
            `color: ${response.ok ? 'green' : 'red'}; font-weight: bold`, {
            url,
            status: response.status,
            statusText: response.statusText,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
          });
          
          // Try to log the response body for debugging
          if (!response.ok) {
            clone.text().then(text => {
              try {
                const json = JSON.parse(text);
                console.log(`%c[API Error ${reqId}]`, 'color: red', json);
              } catch {
                console.log(`%c[API Error ${reqId}]`, 'color: red', text);
              }
            }).catch(e => {
              console.log(`%c[API Error ${reqId}]`, 'color: red', 'Could not read response body:', e);
            });
          }
        }
        
        return response;
      })
      .catch(error => {
        if (isApiCall) {
          console.log(`%c[API Failure ${reqId}]`, 'color: red; font-weight: bold', {
            url, 
            error: error.message || error,
            timestamp: new Date().toISOString()
          });
        }
        throw error;
      });
  };
  
  // Add network connectivity check
  function checkNetworkConnectivity() {
    console.log(`Network status: ${navigator.onLine ? 'Online' : 'Offline'}`);
    
    // Test connection to API
    const apiUrl = 'https://fianceapi.dev.wedding.christephanie.com';
    
    console.log('Testing API connectivity...');
    fetch(`${apiUrl}/health`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
      console.log(`API health check: ${response.status}`);
    })
    .catch(error => {
      console.error('API health check failed:', error);
    });
  }
  
  // Log CORS info
  console.log('API Debug Monitoring Active');
  console.log('Auth0 Domain:', window.AUTH0_DOMAIN || 'Not available');
  console.log('API URL:', window.API_URL || 'Not available');
  
  // Expose debugging functions 
  window.apiDebug = {
    checkNetwork: checkNetworkConnectivity,
    config: () => {
      try {
        // Try to get config from app
        const appConfig = document.querySelector('meta[name="api-config"]')?.content;
        return appConfig ? JSON.parse(appConfig) : 'Config not found';
      } catch (e) {
        return 'Error getting config';
      }
    }
  };
  
  // Run initial network check
  checkNetworkConnectivity();
})();