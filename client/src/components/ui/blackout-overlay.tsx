import React from 'react';

interface BlackoutOverlayProps {
  isActive: boolean;
}

/**
 * Blackout overlay component that covers the entire screen with black
 * Used for screenshot protection
 */
export const BlackoutOverlay: React.FC<BlackoutOverlayProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        zIndex: 2147483647, // Maximum z-index value
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      aria-hidden="true"
    />
  );
};