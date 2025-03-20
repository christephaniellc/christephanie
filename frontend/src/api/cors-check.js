// CORS Check - can be run from browser console

(function checkApiCORS() {
  const devApiUrl = 'https://fianceapi.dev.wedding.christephanie.com';
  const prodApiUrl = 'https://fianceapi.wedding.christephanie.com';
  
  console.log('Running CORS Check...');
  
  // Function to test an endpoint with different methods
  const testEndpoint = (url, method = 'GET', headers = {}) => {
    console.log(`Testing ${method} ${url}...`);
    
    return fetch(url, { 
      method, 
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      // For non-GET methods, include an empty body
      ...(method !== 'GET' ? { body: JSON.stringify({}) } : {})
    })
    .then(response => {
      console.log(`${method} ${url} -> Status: ${response.status}`);
      console.log('  Headers:', [...response.headers.entries()]);
      return { url, method, status: response.status, ok: response.ok };
    })
    .catch(error => {
      console.error(`${method} ${url} -> Error:`, error.message);
      return { url, method, error: error.message };
    });
  };
  
  // Test OPTIONS preflight for both APIs
  const corsChecks = [
    // Health checks (shouldn't require auth)
    testEndpoint(`${devApiUrl}/health`),
    testEndpoint(`${prodApiUrl}/health`),
    
    // OPTIONS preflight checks
    testEndpoint(`${devApiUrl}/health`, 'OPTIONS'),
    testEndpoint(`${prodApiUrl}/health`, 'OPTIONS'),
    
    // With origin header
    testEndpoint(`${devApiUrl}/health`, 'GET', { 
      'Origin': 'http://localhost:5173' 
    }),
    testEndpoint(`${prodApiUrl}/health`, 'GET', { 
      'Origin': 'http://localhost:5173' 
    })
  ];
  
  // Run all checks and summarize results
  Promise.all(corsChecks).then(results => {
    console.log('===== CORS Check Summary =====');
    
    const successful = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok && !r.error).length;
    const errors = results.filter(r => r.error).length;
    
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    console.log(`Errors: ${errors}`);
    
    if (errors > 0) {
      console.error('There are CORS or network connectivity issues!');
      console.log('Possible solutions:');
      console.log('1. Check if the API is accessible from your network');
      console.log('2. Verify that the API has CORS headers configured for localhost:5173');
      console.log('3. Check if there are any network proxies or firewalls blocking the requests');
    }
  });
  
  return 'CORS check running in the background...';
})();