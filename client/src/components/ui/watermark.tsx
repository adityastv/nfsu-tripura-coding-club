import { useEffect, useState } from 'react';

interface WatermarkProps {
  text?: string;
  userId?: string;
  timestamp?: boolean;
}

/**
 * Watermark component that overlays protection text across the screen
 * Makes screenshots less useful by adding identification information
 */
export function Watermark({ 
  text = 'NFSU Coding Club - Protected Content', 
  userId, 
  timestamp = true 
}: WatermarkProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (timestamp) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timestamp]);

  const watermarkText = [
    text,
    userId && `User: ${userId}`,
    timestamp && `Time: ${currentTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
  ].filter(Boolean).join(' | ');

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      style={{
        background: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 200px,
          rgba(255, 255, 255, 0.02) 200px,
          rgba(255, 255, 255, 0.02) 250px
        )`
      }}
    >
      {/* Multiple watermark instances for better coverage */}
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          className="absolute text-xs opacity-5 select-none"
          style={{
            top: `${(i % 4) * 25 + 10}%`,
            left: `${(i % 5) * 20 + 5}%`,
            transform: `rotate(${-45 + (i % 3) * 30}deg)`,
            color: 'currentColor',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        >
          {watermarkText}
        </div>
      ))}
    </div>
  );
}