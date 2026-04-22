export interface StyleConfig {
  transitionDuration: number;
  defaultTransition: string;
  filmGrainIntensity: number;
  colorGrade: 'warm' | 'cool' | 'neutral';
  typography: 'bold' | 'elegant' | 'minimal';
  pacing: 'slow' | 'medium' | 'fast';
  vignetteIntensity: number;
  lightLeakEnabled: boolean;
  durationMultiplier: number;
}

export const STYLE_CONFIGS: Record<string, StyleConfig> = {
  cinematic: {
    transitionDuration: 18,
    defaultTransition: 'crossfade',
    filmGrainIntensity: 0.15,
    colorGrade: 'warm',
    typography: 'elegant',
    pacing: 'slow',
    vignetteIntensity: 0.4,
    lightLeakEnabled: true,
    durationMultiplier: 1.2,
  },
  fast_cuts: {
    transitionDuration: 6,
    defaultTransition: 'flash',
    filmGrainIntensity: 0.05,
    colorGrade: 'neutral',
    typography: 'bold',
    pacing: 'fast',
    vignetteIntensity: 0.1,
    lightLeakEnabled: false,
    durationMultiplier: 0.7,
  },
  minimal: {
    transitionDuration: 12,
    defaultTransition: 'crossfade',
    filmGrainIntensity: 0,
    colorGrade: 'cool',
    typography: 'minimal',
    pacing: 'medium',
    vignetteIntensity: 0.2,
    lightLeakEnabled: false,
    durationMultiplier: 1.0,
  },
};

export function getStyleConfig(style: string): StyleConfig {
  return STYLE_CONFIGS[style] || STYLE_CONFIGS.cinematic;
}
