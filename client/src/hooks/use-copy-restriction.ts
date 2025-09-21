import { useCallback, useEffect } from 'react';

/**
 * Hook to restrict copy operations while allowing paste operations
 * Used in student portal to prevent copying of code/solutions
 */
export function useCopyRestriction() {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Prevent Ctrl+C and Ctrl+A (copy and select all)
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        return false;
      }
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        return false;
      }
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // Prevent right-click context menu to disable copy option
    e.preventDefault();
    return false;
  }, []);

  const handleCopy = useCallback((e: React.ClipboardEvent) => {
    // Prevent copy operation
    e.preventDefault();
    return false;
  }, []);

  const handleCut = useCallback((e: React.ClipboardEvent) => {
    // Prevent cut operation
    e.preventDefault();
    return false;
  }, []);

  return {
    onKeyDown: handleKeyDown,
    onContextMenu: handleContextMenu,
    onCopy: handleCopy,
    onCut: handleCut,
  };
}

/**
 * Hook to apply global copy protection across the entire webpage
 * Prevents text selection, copying, and right-click while preserving paste functionality
 */
export function useGlobalCopyProtection() {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+A, Ctrl+X (copy, select all, cut)
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' || e.key === 'C' || e.key === 'a' || e.key === 'A' || e.key === 'x' || e.key === 'X') {
          // Allow paste operations (Ctrl+V) to work in input fields
          if (e.key === 'v' || e.key === 'V') {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
      
      // Prevent F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Prevent Ctrl+Shift+I (Developer Tools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Prevent Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleGlobalContextMenu = (e: Event) => {
      // Prevent right-click context menu
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleGlobalCopy = (e: ClipboardEvent) => {
      // Prevent copy operation
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleGlobalCut = (e: ClipboardEvent) => {
      // Prevent cut operation
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleSelectStart = (e: Event) => {
      // Prevent text selection by mouse
      const target = e.target as HTMLElement;
      
      // Allow text selection in input fields and textareas
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Add global event listeners
    document.addEventListener('keydown', handleGlobalKeyDown, true);
    document.addEventListener('contextmenu', handleGlobalContextMenu, true);
    document.addEventListener('copy', handleGlobalCopy, true);
    document.addEventListener('cut', handleGlobalCut, true);
    document.addEventListener('selectstart', handleSelectStart, true);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
      document.removeEventListener('contextmenu', handleGlobalContextMenu, true);
      document.removeEventListener('copy', handleGlobalCopy, true);
      document.removeEventListener('cut', handleGlobalCut, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
    };
  }, []);
}