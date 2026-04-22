import React from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';

export const SplitReveal: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();

  // Reveal left to right over 20 frames
  const revealProgress = interpolate(frame, [0, 20], [0, 100], { extrapolateRight: 'clamp' });
  const clipPath = `polygon(0 0, ${revealProgress}% 0, ${revealProgress}% 100%, 0 100%)`;

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          clipPath,
        }}
      />
    </div>
  );
};
