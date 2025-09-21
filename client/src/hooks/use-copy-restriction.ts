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
 * Hook to apply global copy and screenshot protection across the entire webpage
 * Prevents text selection, copying, right-click, and screenshot capture
 */
export function useGlobalCopyProtection() {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+A, Ctrl+X (copy, select all, cut)
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' || e.key === 'C' || e.key === 'a' || e.key === 'A' || e.key === 'x' || e.key === 'X') {
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

      // Screenshot protection - prevent various screenshot combinations
      
      // Prevent Print Screen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Prevent Alt + Print Screen (active window screenshot)
      if (e.altKey && e.key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Prevent Windows + Print Screen (Windows screenshot to file)
      if ((e.metaKey || e.key === 'Meta') && e.key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Prevent Windows + Shift + S (Windows Snipping Tool)
      if ((e.metaKey || e.key === 'Meta') && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Prevent Cmd + Shift + 3 (Mac full screenshot)
      if (e.metaKey && e.shiftKey && e.key === '3') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Prevent Cmd + Shift + 4 (Mac area screenshot)
      if (e.metaKey && e.shiftKey && e.key === '4') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Prevent Cmd + Shift + 5 (Mac screenshot utility)
      if (e.metaKey && e.shiftKey && e.key === '5') {
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

    // Add visual protection when window loses focus (potential screenshot attempt)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Add blur overlay when page is hidden
        document.body.style.filter = 'blur(10px)';
        document.body.style.pointerEvents = 'none';
      } else {
        // Remove blur overlay when page is visible
        document.body.style.filter = 'none';
        document.body.style.pointerEvents = 'auto';
      }
    };

    const handleWindowBlur = () => {
      // Temporarily blur content when window loses focus
      document.body.style.filter = 'blur(10px)';
      document.body.style.pointerEvents = 'none';
    };

    const handleWindowFocus = () => {
      // Remove blur when window regains focus
      document.body.style.filter = 'none';
      document.body.style.pointerEvents = 'auto';
    };

    // Prevent drag and drop to avoid content extraction
    const handleDragStart = (e: DragEvent) => {
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
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
      document.removeEventListener('contextmenu', handleGlobalContextMenu, true);
      document.removeEventListener('copy', handleGlobalCopy, true);
      document.removeEventListener('cut', handleGlobalCut, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      
      // Clean up any remaining styles
      document.body.style.filter = 'none';
      document.body.style.pointerEvents = 'auto';
    };
  }, []);
}