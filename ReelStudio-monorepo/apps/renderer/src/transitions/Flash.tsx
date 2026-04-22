import React from 'react';
import { interpolate, Easing } from 'remotion';

interface TransitionProps {
  children: React.ReactNode;
  direction: 'enter' | 'exit';
  progress: number;
}

export const Flash: React.FC<TransitionProps> = ({ children, direction, progress }) => {
  const flashOpacity =
    direction === 'enter'
      ? interpolate(progress, [0, 0.15, 0.3, 1], [1, 0, 0, 0], { easing: Easing.inOut(Easing.ease) })
      : interpolate(progress, [0, 0.7, 0.85, 1], [0, 0, 0, 1], { easing: Easing.inOut(Easing.ease) });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {children}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          opacity: flashOpacity,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
