import React from 'react';
import { AbsoluteFill } from 'remotion';

interface FilmGrainProps {
  intensity: number;
}

export const FilmGrain: React.FC<FilmGrainProps> = ({ intensity }) => {

  const grainOverlay: React.CSSProperties = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundSize: '256px 256px',
    opacity: intensity,
    mixBlendMode: 'overlay',
    pointerEvents: 'none',
  };

  return <AbsoluteFill style={grainOverlay} />;
};
