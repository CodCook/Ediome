import React from 'react';
import { interpolate, Easing } from 'remotion';

interface TransitionProps {
  children: React.ReactNode;
  direction: 'enter' | 'exit';
  progress: number;
}

export const Crossfade: React.FC<TransitionProps> = ({ children, direction, progress }) => {
  const opacity =
    direction === 'enter'
      ? interpolate(progress, [0, 1], [0, 1], { easing: Easing.inOut(Easing.ease) })
      : interpolate(progress, [0, 1], [1, 0], { easing: Easing.inOut(Easing.ease) });

  return <div style={{ width: '100%', height: '100%', opacity }}>{children}</div>;
};
