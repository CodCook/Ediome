import React from 'react';
import { Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface KenBurnsProps {
  src: string;
  noFade?: boolean;
}

export const KenBurns: React.FC<KenBurnsProps> = ({ src, noFade = false }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(
    frame,
    [0, durationInFrames],
    [1.0, 1.08]
  );

  const tx = interpolate(frame, [0, durationInFrames], [0, 20]);
  const ty = interpolate(frame, [0, durationInFrames], [0, -10]);

  const opacity = noFade ? 1 : undefined;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: 'black' }}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
          ...(opacity !== undefined && { opacity }),
        }}
      />
    </div>
  );
};
