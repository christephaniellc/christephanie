// API Endpoint Accessibility Test
// This script tests if the API endpoints are accessible from the current network

(function testApiEndpoints() {
  console.log('===== API ENDPOINT TEST =====');
  
  const apiUrls = [
    'https://fianceapi.dev.wedding.christephanie.com',
    'https://fianceapi.wedding.christephanie.com',
  ];
  
  // Test paths to check
  const testPaths = [
    '/health',
    '/api/status',
    // Add more paths to test as needed
  ];
  
  // Function to test a specific endpoint
  const testEndpoint = (baseUrl, path) => {
    const url = `${baseUrl}${path}`;
    const startTime = Date.now();
    
    return fetch(url, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Set a short timeout
      signal: AbortSignal.timeout(5000)
    })
    .then(response => {
      const duration = Date.now() - startTime;
      console.log(`${url} - Status: ${response.status} (${duration}ms)`);
      return {
        url,
        status: response.status,
        duration,
        success: response.ok
      };
    })
    .catch(error => {
      const duration = Date.now() - startTime;
      console.error(`${url} - Error: ${error.name}: ${error.message} (${duration}ms)`);
      return {
        url,
        error: error.message,
        errorType: error.name,
        duration,
        success: false
      };
    });
  };
  
  // Run tests for each API URL and path
  const allTests = [];
  
  apiUrls.forEach(apiUrl => {
    console.log(`Testing API: ${apiUrl}`);
    
    testPaths.forEach(path => {
      allTests.push(testEndpoint(apiUrl, path));
    });
  });
  
  // Display summary after all tests complete
  Promise.allSettled(allTests).then(results => {
    console.log('===== TEST RESULTS =====');
    
    const successful = results.filter(r => r.value && r.value.success).length;
    const failed = results.filter(r => r.value && !r.value.success).length;
    
    console.log(`Successful API calls: ${successful}/${results.length}`);
    console.log(`Failed API calls: ${failed}/${results.length}`);
    
    if (failed > 0) {
      console.warn('Some API calls failed. Possible issues:');
      console.log('1. API servers may be down');
      console.log('2. CORS may be incorrectly configured');
      console.log('3. Network connectivity or DNS issues');
      console.log('4. Corporate firewall or proxy blocking requests');
    }
    
    // Group results by error type
    const errorGroups = {};
    results.forEach(r => {
      if (r.value && !r.value.success) {
        const type = r.value.errorType || 'Unknown';
        errorGroups[type] = errorGroups[type] || [];
        errorGroups[type].push(r.value);
      }
    });
    
    // Print error groups
    if (Object.keys(errorGroups).length > 0) {
      console.log('===== ERROR TYPES =====');
      for (const [type, errors] of Object.entries(errorGroups)) {
        console.log(`${type}: ${errors.length} errors`);
      }
    }
  });
  
  return 'API endpoint test running in background...';
})();