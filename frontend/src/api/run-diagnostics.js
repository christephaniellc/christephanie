// API Diagnostics Runner
// Add this script to your application and call runApiDiagnostics() from the console

window.runApiDiagnostics = function() {
  console.clear();
  console.log('======= API DIAGNOSTIC TOOLS =======');
  console.log('Running comprehensive API diagnostics...');
  
  // Load and execute all diagnostic scripts
  const scripts = [
    '/src/api/debug-api.js',
    '/src/api/cors-check.js',
    '/src/api/network-check.js',
    '/src/api/endpoint-check.js'
  ];
  
  // Track loaded scripts
  let loadedCount = 0;
  
  scripts.forEach(scriptPath => {
    const script = document.createElement('script');
    script.src = scriptPath;
    script.async = true;
    
    script.onload = () => {
      console.log(`✅ Loaded ${scriptPath}`);
      loadedCount++;
      
      if (loadedCount === scripts.length) {
        console.log('All diagnostic tools loaded and running.');
        console.log('Check console output for results and potential issues.');
        
        // Check for common issues
        checkCommonIssues();
      }
    };
    
    script.onerror = () => {
      console.error(`❌ Failed to load ${scriptPath}`);
      loadedCount++;
    };
    
    document.head.appendChild(script);
  });
  
  // Check for common issues based on browser environment
  function checkCommonIssues() {
    console.log('===== COMMON ISSUE CHECK =====');
    
    // 1. Check for HTTPS mixed content
    if (window.location.protocol === 'https:') {
      const apiUrl = getApiUrl();
      if (apiUrl && apiUrl.startsWith('http:')) {
        console.error('⚠️ Mixed Content Issue: Your app is loaded over HTTPS but API uses HTTP.');
      }
    }
    
    // 2. Check for localhost issues
    if (window.location.hostname === 'localhost') {
      console.log('App running on localhost - API calls to production domains need proper CORS configuration.');
    }
    
    // 3. Check for service workers
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('⚠️ Service Worker is controlling this page and may be intercepting API requests.');
    }
    
    // 4. Check for ad blockers or security extensions
    setTimeout(() => {
      const testDiv = document.createElement('div');
      testDiv.className = 'adsbox';
      testDiv.innerHTML = '&nbsp;';
      document.body.appendChild(testDiv);
      
      setTimeout(() => {
        if (testDiv.offsetHeight === 0) {
          console.warn('⚠️ Ad blocker detected - may be blocking API requests to domains with tracking-related keywords.');
        }
        document.body.removeChild(testDiv);
      }, 100);
    }, 1);
  }
  
  // Try to extract API URL from the app config
  function getApiUrl() {
    try {
      // Look for config in various places
      if (window.__config && window.__config.webserviceUrl) {
        return window.__config.webserviceUrl;
      }
      
      // Try to find config in HTML
      const configMeta = document.querySelector('meta[name="api-url"]');
      if (configMeta) {
        return configMeta.content;
      }
      
      return null;
    } catch (e) {
      return null;
    }
  }
  
  // Return quick guide
  return `
API Diagnostics Started!

To run individual tests:
- Run cors-check: copy and paste the contents of "/src/api/cors-check.js" into console
- Run network-check: copy and paste the contents of "/src/api/network-check.js" into console
- Run endpoint-check: copy and paste the contents of "/src/api/endpoint-check.js" into console

Check console for detailed results.
  `;
};