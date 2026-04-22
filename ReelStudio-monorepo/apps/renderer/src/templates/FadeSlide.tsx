import React from 'react';
import { Img } from 'remotion';

interface FadeSlideProps {
  src: string;
  noFade?: boolean;
}

export const FadeSlide: React.FC<FadeSlideProps> = ({ src, noFade = false }) => {

  if (noFade) {
    return (
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    );
  }

  return (
    <Img
      src={src}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  );
};
