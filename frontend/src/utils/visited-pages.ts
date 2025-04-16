/**
 * Utility functions for tracking visited pages
 */

// Types of pages we track for "new content" indicators
export type VisitedPageType = 'details' | 'registry' | 'stats' | 'rsvp';

// We'll use a constant key for all users to make it simpler
// and ensure state persists between logins
const STORAGE_KEY = 'christephanie_visited_pages';

// Helper for conditional logging in development
const isDev = import.meta.env.MODE === 'development';
const logDebug = (message: string, ...args: any[]) => {
  if (isDev) {
    console.log(`[VisitedPages] ${message}`, ...args);
  }
};

/**
 * Marks a page as visited in localStorage
 * @param pageName The name of the page to mark as visited
 */
export const markPageAsVisited = (pageName: VisitedPageType): void => {
  try {
    // Get current visited pages from localStorage
    const storedVisitedPages = localStorage.getItem(STORAGE_KEY);
    const visitedPages = storedVisitedPages ? JSON.parse(storedVisitedPages) : {};
    
    // Mark the page as visited
    visitedPages[pageName] = true;
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visitedPages));
    
    // Add diagnostic logging
    logDebug(`Page ${pageName} marked as visited and saved to localStorage`, visitedPages);
  } catch (error) {
    console.error('Error marking page as visited:', error);
  }
};

/**
 * Checks if a page has been visited
 * @param pageName The name of the page to check
 * @returns True if the page has been visited, false otherwise
 */
export const hasVisitedPage = (pageName: VisitedPageType): boolean => {
  try {
    const storedVisitedPages = localStorage.getItem(STORAGE_KEY);
    if (!storedVisitedPages) {
      logDebug(`No visited pages found in localStorage for key ${STORAGE_KEY}`);
      return false;
    }
    
    const visitedPages = JSON.parse(storedVisitedPages);
    const visited = !!visitedPages[pageName];
    
    // Add diagnostic logging
    logDebug(`Checking if page ${pageName} has been visited:`, visited);
    return visited;
  } catch (error) {
    console.error('Error checking if page has been visited:', error);
    return false;
  }
};

/**
 * Resets visited pages tracking (useful for testing or when clearing user data)
 */
export const resetVisitedPages = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  logDebug(`Visited pages reset for key ${STORAGE_KEY}`);
};