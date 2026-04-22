import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { StyleConfig } from '../config/styles';

interface EndCardProps {
  styleConfig: StyleConfig;
}

const FONT_MAP: Record<string, string> = {
  bold: 'Inter, system-ui, -apple-system, sans-serif',
  elegant: 'Georgia, "Times New Roman", serif',
  minimal: 'system-ui, -apple-system, sans-serif',
};

export const EndCard: React.FC<EndCardProps> = ({ styleConfig }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeInFrames = styleConfig.pacing === 'fast' ? 6 : 15;
  const fadeOutStart = durationInFrames - (styleConfig.pacing === 'fast' ? 6 : 15);

  const opacity = interpolate(
    frame,
    [0, fadeInFrames, fadeOutStart, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scale = interpolate(
    frame,
    [0, fadeInFrames],
    [0.9, 1],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.ease) }
  );

  const fontFamily = FONT_MAP[styleConfig.typography];
  const fontSize = styleConfig.typography === 'bold' ? '3vw' : '2.5vw';
  const fontWeight = styleConfig.typography === 'bold' ? '700' : styleConfig.typography === 'elegant' ? '400' : '300';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p
          style={{
            fontFamily,
            fontSize,
            fontWeight,
            color: 'rgba(255, 255, 255, 0.7)',
            margin: 0,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Created with ReelStudio
        </p>
      </div>
    </AbsoluteFill>
  );
};
