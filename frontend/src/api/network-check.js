// Network Configuration Check
// Run this in the browser console to diagnose network connectivity issues

(function checkNetworkConfig() {
  console.log('===== NETWORK CONFIGURATION CHECK =====');
  
  // Basic connectivity check
  console.log(`Online status: ${navigator.onLine ? 'ONLINE' : 'OFFLINE'}`);
  
  // Check connection type if available
  if (navigator.connection) {
    console.log('Connection info:', {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    });
  }
  
  // Print user agent
  console.log(`User agent: ${navigator.userAgent}`);
  
  // Test DNS resolution with ping
  const testDns = (domain) => {
    const start = Date.now();
    const img = new Image();
    
    img.onload = () => {
      console.log(`DNS resolution for ${domain}: SUCCESS (${Date.now() - start}ms)`);
    };
    
    img.onerror = () => {
      // This will typically error, but still tells us if DNS resolved
      console.log(`DNS resolution for ${domain}: RESPONDED (${Date.now() - start}ms)`);
    };
    
    img.src = `https://${domain}/favicon.ico?${Date.now()}`;
  };
  
  // Test if we can reach common domains (for DNS/connectivity check)
  testDns('google.com');
  testDns('wedding.christephanie.com');
  testDns('fianceapi.dev.wedding.christephanie.com');
  
  // Check if service workers might be interfering
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        console.log(`Active service workers: ${registrations.length}`);
        registrations.forEach(registration => {
          console.log('Service worker:', {
            scope: registration.scope,
            state: registration.active?.state || 'unknown'
          });
        });
      })
      .catch(err => {
        console.error('Error checking service workers:', err);
      });
  }
  
  // Check for browser extensions that might block requests
  const testBlockingExtensions = () => {
    const knownBlockers = ['uBlock', 'AdBlock', 'Privacy Badger', 'NoScript'];
    
    // Try to detect by looking at DOM for elements these extensions might add
    const possibleBlockers = knownBlockers.filter(blocker => {
      return document.querySelectorAll(`[id*=${blocker}], [class*=${blocker}]`).length > 0;
    });
    
    if (possibleBlockers.length > 0) {
      console.warn('Possible content blockers detected:', possibleBlockers);
    } else {
      console.log('No common content blockers detected in the DOM');
    }
  };
  
  testBlockingExtensions();
  
  // Test API endpoints with an iframe (avoids some CORS issues)
  const testWithIframe = (url) => {
    try {
      const frameName = `test-frame-${Date.now()}`;
      const frame = document.createElement('iframe');
      frame.style.display = 'none';
      frame.name = frameName;
      frame.id = frameName;
      document.body.appendChild(frame);
      
      console.log(`Testing ${url} with iframe...`);
      
      // Set a timeout to clean up
      setTimeout(() => {
        try {
          document.body.removeChild(frame);
        } catch (e) {
          // Ignore
        }
      }, 5000);
    } catch (e) {
      console.error('Error creating test iframe:', e);
    }
  };
  
  // Delay the iframe tests slightly
  setTimeout(() => {
    testWithIframe('https://fianceapi.dev.wedding.christephanie.com/health');
  }, 1000);
  
  return 'Network configuration check running...';
})();