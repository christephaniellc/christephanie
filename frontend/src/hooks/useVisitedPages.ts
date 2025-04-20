import { useState, useEffect, useCallback } from 'react';
import { VisitedPageType, markPageAsVisited, hasVisitedPage, resetVisitedPages } from '@/utils/visited-pages';

// Helper for conditional logging in development
const isDev = import.meta.env.MODE === 'development';
const logDebug = (message: string, ...args: any[]) => {
  if (isDev) {
    //console.log(`[useVisitedPages] ${message}`, ...args);
  }
};

/**
 * Hook to work with visited pages
 * Provides functionality to check, mark, and reset visited pages
 */
export const useVisitedPages = () => {
  // State to track page visited status (for re-renders)
  const [visitedPages, setVisitedPages] = useState({
    details: false,
    registry: false,
    stats: false,
    rsvp: false
  });

  // Load initial values from localStorage on mount
  useEffect(() => {
    logDebug('Hook initialized');
    refreshVisitedPagesFromStorage();
  }, []); 

  // Function to refresh state from localStorage
  const refreshVisitedPagesFromStorage = useCallback(() => {
    logDebug('Refreshing visited pages from storage');
    setVisitedPages({
      details: hasVisitedPage('details'),
      registry: hasVisitedPage('registry'),
      stats: hasVisitedPage('stats'),
      rsvp: hasVisitedPage('rsvp')
    });
  }, []);

  /**
   * Mark a page as visited
   */
  const markVisited = useCallback((page: VisitedPageType) => {
    logDebug(`Marking page ${page} as visited`);
    markPageAsVisited(page);
    setVisitedPages(prev => ({ ...prev, [page]: true }));
  }, []);

  /**
   * Reset all visited page tracking
   */
  const resetAll = useCallback(() => {
    logDebug('Resetting all visited pages');
    resetVisitedPages();
    setVisitedPages({
      details: false,
      registry: false,
      stats: false,
      rsvp: false
    });
  }, []);

  return {
    visitedPages,
    markVisited,
    resetAll,
    refreshVisitedPagesFromStorage
  };
};