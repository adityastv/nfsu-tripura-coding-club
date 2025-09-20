import { useCallback } from 'react';

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