import React from 'react';
import { interpolate, Easing } from 'remotion';

interface PresentationProps {
  presentationDirection: 'entering' | 'exiting';
  presentationProgress: number;
  children: React.ReactNode;
}

export const CrossfadePresentation: React.FC<PresentationProps> = ({
  presentationDirection,
  presentationProgress,
  children,
}) => {
  const isEntering = presentationDirection === 'entering';
  const opacity = isEntering
    ? interpolate(presentationProgress, [0, 1], [0, 1], { easing: Easing.inOut(Easing.ease) })
    : interpolate(presentationProgress, [0, 1], [1, 0], { easing: Easing.inOut(Easing.ease) });

  return <div style={{ width: '100%', height: '100%', opacity }}>{children}</div>;
};

export const SlideLeftPresentation: React.FC<PresentationProps> = ({
  presentationDirection,
  presentationProgress,
  children,
}) => {
  const isEntering = presentationDirection === 'entering';
  const translateX = isEntering
    ? interpolate(presentationProgress, [0, 1], [100, 0], { easing: Easing.inOut(Easing.ease) })
    : interpolate(presentationProgress, [0, 1], [0, -100], { easing: Easing.inOut(Easing.ease) });

  const opacity = isEntering
    ? interpolate(presentationProgress, [0, 0.3], [0, 1], { easing: Easing.inOut(Easing.ease) })
    : interpolate(presentationProgress, [0.7, 1], [1, 0], { easing: Easing.inOut(Easing.ease) });

  return (
    <div style={{ width: '100%', height: '100%', transform: `translateX(${translateX}%)`, opacity }}>
      {children}
    </div>
  );
};

export const SlideRightPresentation: React.FC<PresentationProps> = ({
  presentationDirection,
  presentationProgress,
  children,
}) => {
  const isEntering = presentationDirection === 'entering';
  const translateX = isEntering
    ? interpolate(presentationProgress, [0, 1], [-100, 0], { easing: Easing.inOut(Easing.ease) })
    : interpolate(presentationProgress, [0, 1], [0, 100], { easing: Easing.inOut(Easing.ease) });

  const opacity = isEntering
    ? interpolate(presentationProgress, [0, 0.3], [0, 1], { easing: Easing.inOut(Easing.ease) })
    : interpolate(presentationProgress, [0.7, 1], [1, 0], { easing: Easing.inOut(Easing.ease) });

  return (
    <div style={{ width: '100%', height: '100%', transform: `translateX(${translateX}%)`, opacity }}>
      {children}
    </div>
  );
};

export const ZoomInPresentation: React.FC<PresentationProps> = ({
  presentationDirection,
  presentationProgress,
  children,
}) => {
  const isEntering = presentationDirection === 'entering';
  const scale = isEntering
    ? interpolate(presentationProgress, [0, 1], [1.5, 1], { easing: Easing.inOut(Easing.ease) })
    : interpolate(presentationProgress, [0, 1], [1, 1.5], { easing: Easing.inOut(Easing.ease) });

  const opacity = isEntering
    ? interpolate(presentationProgress, [0, 1], [0, 1], { easing: Easing.inOut(Easing.ease) })
    : interpolate(presentationProgress, [0, 1], [1, 0], { easing: Easing.inOut(Easing.ease) });

  return (
    <div style={{ width: '100%', height: '100%', transform: `scale(${scale})`, opacity }}>
      {children}
    </div>
  );
};

export const ZoomOutPresentation: React.FC<PresentationProps> = ({
  presentationDirection,
  presentationProgress,
  children,
}) => {
  const isEntering = presentationDirection === 'entering';
  const scale = isEntering
    ? interpolate(presentationProgress, [0, 1], [0.5, 1], { easing: Easing.inOut(Easing.ease) })
    : interpolate(presentationProgress, [0, 1], [1, 0.5], { easing: Easing.inOut(Easing.ease) });

  const opacity = isEntering
    ? interpolate(presentationProgress, [0, 1], [0, 1], { easing: Easing.inOut(Easing.ease) })
    : interpolate(presentationProgress, [0, 1], [1, 0], { easing: Easing.inOut(Easing.ease) });

  return (
    <div style={{ width: '100%', height: '100%', transform: `scale(${scale})`, opacity }}>
      {children}
    </div>
  );
};

export const WipePresentation: React.FC<PresentationProps> = ({
  presentationDirection,
  presentationProgress,
  children,
}) => {
  const isEntering = presentationDirection === 'entering';
  const clipProgress = isEntering
    ? interpolate(presentationProgress, [0, 1], [0, 100], { easing: Easing.inOut(Easing.ease) })
    : interpolate(presentationProgress, [0, 1], [100, 0], { easing: Easing.inOut(Easing.ease) });

  const clipPath = `polygon(0 0, ${clipProgress}% 0, ${clipProgress}% 100%, 0 100%)`;

  return (
    <div style={{ width: '100%', height: '100%', clipPath }}>
      {children}
    </div>
  );
};

export const FlashPresentation: React.FC<PresentationProps> = ({
  presentationDirection,
  presentationProgress,
  children,
}) => {
  const isEntering = presentationDirection === 'entering';
  const flashOpacity = isEntering
    ? interpolate(presentationProgress, [0, 0.15, 0.3, 1], [1, 0, 0, 0], { easing: Easing.inOut(Easing.ease) })
    : interpolate(presentationProgress, [0, 0.7, 0.85, 1], [0, 0, 0, 1], { easing: Easing.inOut(Easing.ease) });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {children}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          opacity: flashOpacity,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export const CutPresentation: React.FC<PresentationProps> = ({ children }) => {
  return <div style={{ width: '100%', height: '100%' }}>{children}</div>;
};
