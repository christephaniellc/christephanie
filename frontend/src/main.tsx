import welcome from '@/utils/welcome';
// Load the force-refresh utility to make it available globally
import '@/utils/force-refresh';

// Root contains the main dependencies and providers of the base app
//  - React, ReactDom, RecoilRoot, HelmetProvider, ThemeProvider, MUI-core)
// App contains the main structure of the base app

// These are the two main chunks that are used to render the core structure of the app
// Importing them with Promise.all (by using HTTP/2 multiplexing) we can load them in parallel
// and achieve the best possible performance

Promise.all([import('@/Root'), import('@/App')]).then(([{ default: render }, { default: App }]) => {
  render(App);
});

// welcome message for users in the console
welcome();

// Add debug info to console
const appVersion = import.meta.env.VITE_APP_VERSION || 'development';
console.log(
  `%cBuild: ${appVersion}`, 
  'background:#1976d2; color:white; padding:4px 8px; border-radius:4px; font-weight:bold'
);
console.log(
  `%cTo force a clean refresh, run: window.forceRefresh()`, 
  'background:#4caf50; color:white; padding:4px 8px; border-radius:4px; font-weight:bold'
);

// ts(1208)
export {};
