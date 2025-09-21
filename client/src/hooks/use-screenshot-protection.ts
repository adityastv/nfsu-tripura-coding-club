import { useEffect, useCallback, useState } from 'react';

/**
 * Hook to prevent screenshots by obscuring the screen content
 * Uses multiple detection methods to trigger a black overlay
 */
export function useScreenshotProtection() {
  const [isBlackoutActive, setIsBlackoutActive] = useState(false);

  // Function to trigger blackout
  const triggerBlackout = useCallback(() => {
    setIsBlackoutActive(true);
    // Remove blackout after a short delay
    setTimeout(() => {
      setIsBlackoutActive(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let blackoutTimeout: NodeJS.Timeout;

    // Method 1: Detect common screenshot keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Windows: Print Screen, Alt+Print Screen, Win+Print Screen, Win+Shift+S
      if (e.key === 'PrintScreen' || 
          (e.altKey && e.key === 'PrintScreen') ||
          ((e.metaKey || e.key === 'Meta') && e.key === 'PrintScreen') ||
          ((e.metaKey || e.key === 'Meta') && e.shiftKey && e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout();
        return false;
      }

      // macOS: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        if (e.key === '3' || e.key === '4' || e.key === '5') {
          e.preventDefault();
          e.stopPropagation();
          triggerBlackout();
          return false;
        }
      }

      // Additional screenshot tools and browser developer tools
      // F12 (already handled in copy protection, but reinforcing)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout();
        return false;
      }

      // Ctrl+Shift+I (Developer tools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout();
        return false;
      }
    };

    // Method 2: Detect page visibility changes (some screenshot tools hide the page briefly)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page became hidden - potential screenshot attempt
        triggerBlackout();
      }
    };

    // Method 3: Detect focus changes that might indicate screenshot tools
    const handleBlur = () => {
      // Window lost focus - potential screenshot tool opened
      triggerBlackout();
    };

    const handleFocus = () => {
      // Clear any pending blackout when window regains focus
      if (blackoutTimeout) {
        clearTimeout(blackoutTimeout);
      }
      // Brief blackout when regaining focus (in case screenshot was taken while blurred)
      blackoutTimeout = setTimeout(() => {
        setIsBlackoutActive(false);
      }, 200);
    };

    // Method 4: Prevent media capture APIs
    const blockMediaCapture = () => {
      // Override getDisplayMedia if available
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        navigator.mediaDevices.getDisplayMedia = function() {
          triggerBlackout();
          return Promise.reject(new Error('Screen capture is not allowed'));
        };
        
        // Store original method for cleanup
        return () => {
          navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
        };
      }
      return () => {};
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange, true);
    window.addEventListener('blur', handleBlur, true);
    window.addEventListener('focus', handleFocus, true);
    
    // Block media capture
    const restoreMediaCapture = blockMediaCapture();

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange, true);
      window.removeEventListener('blur', handleBlur, true);
      window.removeEventListener('focus', handleFocus, true);
      restoreMediaCapture();
      
      if (blackoutTimeout) {
        clearTimeout(blackoutTimeout);
      }
    };
  }, [triggerBlackout]);

  return isBlackoutActive;
}