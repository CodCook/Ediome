import React from 'react';
import { interpolate, Easing } from 'remotion';

interface TransitionProps {
  children: React.ReactNode;
  direction: 'enter' | 'exit';
  progress: number;
}

export const Wipe: React.FC<TransitionProps> = ({ children, direction, progress }) => {
  const clipProgress =
    direction === 'enter'
      ? interpolate(progress, [0, 1], [0, 100], { easing: Easing.inOut(Easing.ease) })
      : interpolate(progress, [0, 1], [100, 0], { easing: Easing.inOut(Easing.ease) });

  const clipPath = `polygon(0 0, ${clipProgress}% 0, ${clipProgress}% 100%, 0 100%)`;

  return (
    <div style={{ width: '100%', height: '100%', clipPath }}>
      {children}
    </div>
  );
};
