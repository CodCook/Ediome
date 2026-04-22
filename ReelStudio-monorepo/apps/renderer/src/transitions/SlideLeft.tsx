import React from 'react';
import { interpolate, Easing } from 'remotion';

interface TransitionProps {
  children: React.ReactNode;
  direction: 'enter' | 'exit';
  progress: number;
}

export const SlideLeft: React.FC<TransitionProps> = ({ children, direction, progress }) => {
  const translateX =
    direction === 'enter'
      ? interpolate(progress, [0, 1], [100, 0], { easing: Easing.inOut(Easing.ease) })
      : interpolate(progress, [0, 1], [0, -100], { easing: Easing.inOut(Easing.ease) });

  const opacity =
    direction === 'enter'
      ? interpolate(progress, [0, 0.3], [0, 1], { easing: Easing.inOut(Easing.ease) })
      : interpolate(progress, [0.7, 1], [1, 0], { easing: Easing.inOut(Easing.ease) });

  return (
    <div style={{ width: '100%', height: '100%', transform: `translateX(${translateX}%)`, opacity }}>
      {children}
    </div>
  );
};
