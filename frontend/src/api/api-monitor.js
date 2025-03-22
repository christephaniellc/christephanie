// API Monitoring Script - Wedding App Specific
// Load this script to monitor and diagnose API issues in real-time

(function() {
  console.clear();
  console.log('%cWedding API Monitor', 'font-size:20px; font-weight:bold; color:#3f51b5;');
  console.log('Initializing API monitoring...');
  
  // Get access to the Auth0 instance if available
  let auth0Client = null;
  let apiInstance = null;
  
  // Try to get API and Auth0 instances from the app's context
  function findAppInstances() {
    try {
      // Look for API context in React components
      const apiContext = Array.from(document.querySelectorAll('*'))
        .find(el => el.__reactFiber$?._debugOwner?.stateNode?.apiRef?.current);
      
      if (apiContext?.__reactFiber$?._debugOwner?.stateNode?.apiRef?.current) {
        apiInstance = apiContext.__reactFiber$._debugOwner.stateNode.apiRef.current;
        console.log('✅ Found API instance:', apiInstance);
      }
      
      // Try to find Auth0 client instance
      const auth0Context = Array.from(document.querySelectorAll('*'))
        .find(el => el.__reactFiber$?._debugOwner?.stateNode?.auth0Client);
      
      if (auth0Context?.__reactFiber$?._debugOwner?.stateNode?.auth0Client) {
        auth0Client = auth0Context.__reactFiber$._debugOwner.stateNode.auth0Client;
        console.log('✅ Found Auth0 client instance:', auth0Client);
      }
      
      return !!apiInstance || !!auth0Client;
    } catch (e) {
      console.log('⚠️ Could not find app instances:', e);
      return false;
    }
  }
  
  // Find the API URL from config
  let apiUrl = null;
  try {
    // Try different ways to find API URL
    if (window.__config && window.__config.webserviceUrl) {
      apiUrl = window.__config.webserviceUrl;
    } else if (window.localStorage && localStorage.getItem('apiUrl')) {
      apiUrl = localStorage.getItem('apiUrl');
    } else {
      // Read from import.meta if available
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        if (script.textContent && script.textContent.includes('fianceapi.dev.wedding.christephanie.com')) {
          apiUrl = 'https://fianceapi.dev.wedding.christephanie.com';
          break;
        }
        if (script.textContent && script.textContent.includes('fianceapi.wedding.christephanie.com')) {
          apiUrl = 'https://fianceapi.wedding.christephanie.com';
          break;
        }
      }
    }
    
    console.log(`🔗 API URL: ${apiUrl || 'Unknown'}`);
  } catch (e) {
    console.error('Error detecting API URL:', e);
  }
  
  // Intercept all fetch requests
  const originalFetch = window.fetch;
  
  window.fetch = function(url, options = {}) {
    const isApiRequest = typeof url === 'string' && (
      url.includes('fianceapi') || 
      (apiUrl && url.includes(apiUrl))
    );
    
    const requestId = Math.random().toString(36).substring(2, 8);
    const startTime = performance.now();
    
    // Always log API requests for debugging
    if (isApiRequest) {
      console.group(`🌐 API Request [${requestId}]`);
      console.log(`URL: ${url}`);
      console.log(`Method: ${options.method || 'GET'}`);
      
      if (options.headers) {
        // Check for auth header
        const hasAuth = Object.entries(options.headers).some(([key, val]) => 
          key.toLowerCase() === 'authorization' && val
        );
        console.log(`Auth Header: ${hasAuth ? '✅ Present' : '❌ Missing'}`);
      } else {
        console.log(`Headers: None`);
      }
      
      // Log request body if present
      if (options.body) {
        try {
          const bodyObj = JSON.parse(options.body);
          console.log('Body:', bodyObj);
        } catch {
          console.log(`Body: <binary or non-JSON data>`);
        }
      }
      console.groupEnd();
    }
    
    // Special handling for API requests - add monitoring and diagnostics
    if (isApiRequest) {
      // Create a promise that rejects after a timeout (10s)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timeout after 10s: ${url}`));
        }, 10000);
      });
      
      // Add connection info to the error if fetch fails with a network error
      return Promise.race([
        originalFetch(url, options)
          .then(response => {
            const duration = Math.round(performance.now() - startTime);
            
            if (response.ok) {
              console.log(`✅ API Success [${requestId}] - ${response.status} ${url} (${duration}ms)`);
            } else {
              console.group(`❌ API Error [${requestId}] - ${response.status} ${url} (${duration}ms)`);
              console.log(`Status: ${response.status} ${response.statusText}`);
              
              // Clone the response and try to read the body for more details
              response.clone().text().then(text => {
                try {
                  const errorJson = JSON.parse(text);
                  console.log('Error details:', errorJson);
                } catch {
                  console.log('Response:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
                }
              }).catch(e => {
                console.log('Could not read response body:', e);
              });
              
              console.groupEnd();
            }
            
            return response;
          })
          .catch(error => {
            const duration = Math.round(performance.now() - startTime);
            console.group(`❌ API Failure [${requestId}] - ${url} (${duration}ms)`);
            console.error('Error:', error.message);
            
            // Add connection diagnostics for network errors
            if (error.message.includes('Failed to fetch')) {
              console.log('Connection diagnostics:');
              console.log(`- Navigator online: ${navigator.onLine}`);
              console.log(`- Connection type: ${navigator.connection?.effectiveType || 'unknown'}`);
              console.log(`- API URL: ${apiUrl || 'unknown'}`);
            }
            
            console.groupEnd();
            throw error;
          }),
        timeoutPromise
      ]);
    }
    
    // Non-API requests pass through normally
    return originalFetch(url, options);
  };
  
  // Monitor auth0 issues
  let lastTokenError = null;
  const checkAuth0 = () => {
    if (!auth0Client) {
      console.log('⚠️ Auth0 client not found, cannot check auth status');
      return;
    }
    
    console.group('🔐 Auth0 Status Check');
    try {
      const isAuthenticated = auth0Client.isAuthenticated();
      console.log(`Authenticated: ${isAuthenticated ? '✅' : '❌'}`);
      
      if (isAuthenticated) {
        auth0Client.getTokenSilently().then(token => {
          if (!token) {
            console.log('⚠️ No token available even though authenticated');
            return;
          }
          
          // Basic JWT checks
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            const now = Math.floor(Date.now() / 1000);
            const expiresIn = payload.exp - now;
            
            console.log(`Token expires in: ${expiresIn} seconds (${new Date(payload.exp * 1000).toLocaleTimeString()})`);
            console.log(`Subject: ${payload.sub}`);
            
            if (expiresIn < 0) {
              console.log('⚠️ Token has already expired!');
            } else if (expiresIn < 300) { // 5 minutes
              console.log('⚠️ Token expiring soon!');
            }
          } catch (e) {
            console.error('Error inspecting token:', e);
          }
        }).catch(error => {
          lastTokenError = error;
          console.error('Failed to get token:', error);
        });
      }
    } catch (e) {
      console.error('Error checking auth status:', e);
    }
    console.groupEnd();
  };
  
  // Monitor for CORS issues
  const checkCORS = async () => {
    if (!apiUrl) {
      console.log('⚠️ API URL not detected, cannot check CORS');
      return;
    }
    
    console.group('🔄 CORS Check');
    try {
      // Simple HEAD request to check if the API is accessible
      const corsResult = await fetch(`${apiUrl}/health`, {
        method: 'HEAD',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      });
      
      console.log(`CORS status: ${corsResult.ok ? '✅ OK' : '❌ Failed'} (${corsResult.status})`);
      
      // Check CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': corsResult.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': corsResult.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': corsResult.headers.get('Access-Control-Allow-Headers')
      };
      
      console.log('CORS Headers:', corsHeaders);
      
      // Check for common CORS issues
      if (!corsHeaders['Access-Control-Allow-Origin']) {
        console.log('⚠️ Missing CORS headers - API may not allow cross-origin requests');
      } else if (corsHeaders['Access-Control-Allow-Origin'] !== '*' && 
                !corsHeaders['Access-Control-Allow-Origin'].includes(window.location.origin)) {
        console.log(`⚠️ CORS origin mismatch - API allows ${corsHeaders['Access-Control-Allow-Origin']} but you're on ${window.location.origin}`);
      }
    } catch (e) {
      console.error('CORS check failed:', e);
      console.log('⚠️ This is likely a CORS issue or the API is not accessible');
    }
    console.groupEnd();
  };
  
  // Check if we have proxy issues
  const checkConnectivity = () => {
    console.group('🌐 Network Connectivity');
    if ('connection' in navigator) {
      console.log('Connection:', {
        type: navigator.connection.effectiveType,
        downlink: `${navigator.connection.downlink} Mbps`,
        rtt: `${navigator.connection.rtt}ms`,
        saveData: navigator.connection.saveData
      });
    }
    
    // Check if the browser is online
    console.log(`Browser online: ${navigator.onLine ? '✅' : '❌'}`);
    
    // Test if we can reach common domains
    const domains = [
      'google.com',
      'christephanie.com',
      'fianceapi.dev.wedding.christephanie.com'
    ];
    
    domains.forEach(domain => {
      const img = new Image();
      const startTime = performance.now();
      
      img.onload = img.onerror = () => {
        const duration = Math.round(performance.now() - startTime);
        console.log(`${domain}: ${duration < 5000 ? '✅' : '⚠️'} (${duration}ms)`);
      };
      
      img.src = `https://${domain}/favicon.ico?${Date.now()}`;
    });
    
    console.groupEnd();
  };
  
  // Run all checks
  const runAllChecks = () => {
    console.clear();
    console.log('%cWedding API Monitor - Full Diagnostic', 'font-size:16px; font-weight:bold; color:#3f51b5;');
    
    // Find app instances first
    findAppInstances();
    
    // Run checks in sequence
    checkConnectivity();
    setTimeout(checkCORS, 500);
    setTimeout(checkAuth0, 1000);
    
    if (apiInstance) {
      console.group('🔍 API Instance Info');
      console.log('API Token Cache:', apiInstance.tokenCache);
      console.log('API Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(apiInstance))
        .filter(m => typeof apiInstance[m] === 'function'));
      console.groupEnd();
    }
    
    // Check for React Query instances
    const checkReactQuery = () => {
      try {
        // Find React Query devtools if enabled
        const queryCache = window.__REACT_QUERY_DEVTOOLS_GLOBAL_INTERNALS__?.queryCache;
        if (queryCache) {
          console.group('🔄 React Query Cache');
          const queries = queryCache.getAll();
          console.log(`Active queries: ${queries.length}`);
          
          // Find API queries
          const apiQueries = queries.filter(q => 
            q.queryKey && (
              q.queryKey.includes('getFamilyUnit') || 
              q.queryKey.includes('validateAddress') ||
              q.queryKey.includes('getFamilyPatch')
            )
          );
          
          if (apiQueries.length > 0) {
            console.log('API-related queries:', apiQueries.map(q => ({
              key: q.queryKey,
              status: q.state.status,
              dataUpdatedAt: new Date(q.state.dataUpdatedAt).toLocaleTimeString(),
              error: q.state.error
            })));
          }
          
          console.groupEnd();
        }
      } catch (e) {
        console.log('Could not access React Query cache:', e);
      }
    };
    
    setTimeout(checkReactQuery, 1500);
  };
  
  // Create UI controls to help with monitoring
  const createMonitoringTools = () => {
    // Debug toolbar disabled
    return;
  };
  
  // Run initial checks - disabled
  // setTimeout(runAllChecks, 1000);
  
  // Add the monitoring UI - disabled
  // setTimeout(createMonitoringTools, 2000);
  
  // Expose API monitor to global scope
  window.apiMonitor = {
    runChecks: runAllChecks,
    checkAuth: checkAuth0,
    checkCORS: checkCORS,
    checkConnection: checkConnectivity,
    clearTokenCache: () => {
      if (apiInstance && apiInstance.clearTokenCache) {
        apiInstance.clearTokenCache();
        return true;
      }
      return false;
    }
  };
  
  console.log('API Monitor initialized! Use window.apiMonitor to access tools.');
})();