import React from 'react';

interface TransitionProps {
  children: React.ReactNode;
  direction: 'enter' | 'exit';
  progress: number;
}

export const Cut: React.FC<TransitionProps> = ({ children }) => {
  return <div style={{ width: '100%', height: '100%' }}>{children}</div>;
};
