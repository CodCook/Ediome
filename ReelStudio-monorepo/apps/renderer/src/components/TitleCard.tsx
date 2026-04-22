import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { StyleConfig } from '../config/styles';

interface TitleCardProps {
  title: string;
  styleConfig: StyleConfig;
}

const FONT_MAP: Record<string, string> = {
  bold: 'Inter, system-ui, -apple-system, sans-serif',
  elegant: 'Georgia, "Times New Roman", serif',
  minimal: 'system-ui, -apple-system, sans-serif',
};

export const TitleCard: React.FC<TitleCardProps> = ({ title, styleConfig }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isFast = styleConfig.pacing === 'fast';

  const scale = isFast
    ? interpolate(frame, [0, 6, 12], [0.8, 1, 1], { extrapolateRight: 'clamp' })
    : spring({ frame, fps, config: { damping: 10, stiffness: 80 } });

  const opacity = isFast
    ? interpolate(frame, [0, 4, 8], [0, 1, 1], { extrapolateRight: 'clamp' })
    : interpolate(frame, [0, 20, 40], [0, 1, 1], { extrapolateRight: 'clamp' });

  const fontFamily = FONT_MAP[styleConfig.typography];
  const fontSize = styleConfig.typography === 'bold' ? '5vw' : '4.5vw';
  const fontWeight = styleConfig.typography === 'bold' ? '800' : styleConfig.typography === 'elegant' ? '400' : '300';

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
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontFamily,
            fontSize,
            fontWeight,
            color: 'white',
            margin: 0,
            padding: '0 10%',
            textAlign: 'center',
            letterSpacing: styleConfig.typography === 'elegant' ? '0.05em' : '0',
            textTransform: styleConfig.typography === 'bold' ? 'uppercase' : 'none',
          }}
        >
          {title}
        </h1>
      </div>
    </AbsoluteFill>
  );
};
