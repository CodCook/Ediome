import React from 'react';
import { interpolate, useCurrentFrame, Easing } from 'remotion';
import { StyleConfig } from '../config/styles';

const FONT_MAP: Record<string, string> = {
  bold: 'Inter, system-ui, -apple-system, sans-serif',
  elegant: 'Georgia, "Times New Roman", serif',
  minimal: 'system-ui, -apple-system, sans-serif',
};

interface TextOverlayProps {
  text?: string;
  children: React.ReactNode;
  styleConfig?: StyleConfig;
}

export const TextOverlay: React.FC<TextOverlayProps> = ({ text, children, styleConfig }) => {
  const frame = useCurrentFrame();

  if (!text) {
    return <>{children}</>;
  }

  const pacing = styleConfig?.pacing || 'medium';
  const typography = styleConfig?.typography || 'bold';

  const isFast = pacing === 'fast';
  const isElegant = typography === 'elegant';

  const animDuration = isFast ? 6 : isElegant ? 20 : 12;

  const y = interpolate(frame, [0, animDuration], [20, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });

  const opacity = interpolate(frame, [0, animDuration], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });

  const fontFamily = FONT_MAP[typography];
  const fontSize = isFast ? '4vw' : isElegant ? '3.5vw' : '3.5vw';
  const fontWeight = isFast ? '800' : isElegant ? '400' : '600';
  const letterSpacing = isElegant ? '0.02em' : '0';
  const textTransform = isFast ? 'uppercase' : 'none';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {children}
      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '50%',
          transform: `translate(-50%, ${y}px)`,
          opacity,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          padding: '14px 36px',
          borderRadius: '9999px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '85%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize,
            fontFamily,
            fontWeight,
            textAlign: 'center',
            letterSpacing,
            textTransform,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            lineHeight: 1.3,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
