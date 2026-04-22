import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const LightLeak: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sweepProgress = interpolate(frame, [0, fps * 2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (sweepProgress <= 0 || sweepProgress >= 1) {
    return null;
  }

  const opacity = Math.sin(sweepProgress * Math.PI) * 0.25;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: `linear-gradient(
          90deg,
          transparent ${sweepProgress * 100 - 30}%,
          rgba(255, 140, 50, ${opacity}) ${sweepProgress * 100 - 10}%,
          rgba(255, 100, 150, ${opacity * 0.7}) ${sweepProgress * 100}%,
          transparent ${sweepProgress * 100 + 20}%
        )`,
      }}
    />
  );
};
