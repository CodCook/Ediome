import React from 'react';
import { AbsoluteFill } from 'remotion';

interface ColorGradeProps {
  type: 'warm' | 'cool';
}

const GRADE_COLORS: Record<string, string> = {
  warm: 'rgba(255, 179, 71, 0.08)',
  cool: 'rgba(71, 179, 255, 0.06)',
};

export const ColorGrade: React.FC<ColorGradeProps> = ({ type }) => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        backgroundColor: GRADE_COLORS[type],
      }}
    />
  );
};
