"use client"

import { useEffect, useState } from 'react';
import getCaretCoordinates from 'textarea-caret';

// A simple utility to get a consistent color from a user's ID
const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c'];
const getColorForSession = (sessionId: string) => {
  const charCodeSum = sessionId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COLORS[charCodeSum % COLORS.length];
};

interface UserCaretProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  position: number;
  sessionId: string;
}

export function UserCaret({ textareaRef, position, sessionId }: UserCaretProps) {
  const [coords, setCoords] = useState({ top: -999, left: -999, height: 20 });
  const color = getColorForSession(sessionId);

  useEffect(() => {
    if (textareaRef.current) {
      // Use the library to get the exact pixel coordinates
      const { top, left, height } = getCaretCoordinates(textareaRef.current, position);
      const { scrollTop, scrollLeft } = textareaRef.current;
      
      // Adjust for the textarea's own scroll position
      setCoords({ top: top - scrollTop, left: left - scrollLeft, height });
    }
  }, [position, textareaRef]);

  // Don't render the caret if it's off-screen
  if (coords.top === -999) {
    return null;
  }

  return (
    <div
      className="absolute pointer-events-none transition-all duration-75 ease-linear"
      style={{
        top: coords.top,
        left: coords.left,
        height: coords.height,
      }}
    >
      <div className="w-0.5 h-full" style={{ backgroundColor: color }}>
        <div className="absolute -top-6 -left-1 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap" style={{ backgroundColor: color }}>
          {sessionId.substring(0, 6)}
        </div>
      </div>
    </div>
  );
};
