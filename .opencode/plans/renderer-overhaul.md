# Professional Video Renderer Overhaul

## Problem Statement
The current renderer produces videos that feel like "swapping slides with text over" - no music sync, no nice transitions, no animations. It needs to look like a professional video.

## Current Architecture Analysis

### What exists:
- 5 templates: FadeSlide, KenBurns, ZoomIn, SplitReveal, TextOverlay
- Hardcoded 6-frame crossfade between ALL shots (ignores `shot.transition` field)
- Ignores `style` field completely (cinematic/fast_cuts/minimal)
- Single music track with simple fade in/out
- No intro/outro sequences
- No visual effects (grain, color grading, light leaks)
- Basic system-ui typography

### What's broken:
1. `shot.transition` field is completely unused
2. `style` field never influences rendering
3. No title card or end card
4. All shots transition identically regardless of intent
5. No beat-syncing or audio polish

---

## Implementation Plan

### Phase 1: Transition System

#### 1.1 Create Transition Wrapper Components
New directory: `src/transitions/`

Each transition is a wrapper that takes `children` and applies entrance/exit animations. The key insight: transitions happen BETWEEN shots, so we need to restructure from the current manual crossfade overlap to using Remotion's `TransitionSeries` API.

**Transitions to create:**
- `Crossfade` - Smooth opacity crossfade (12 frames, ease-in-out)
- `SlideLeft` - Current shot slides left, next shot enters from right
- `SlideRight` - Current shot slides right, next shot enters from left  
- `ZoomIn` - Current shot zooms in and fades, next shot zooms from center
- `ZoomOut` - Current shot zooms out and fades, next shot zooms from edges
- `Wipe` - Directional wipe reveal (left-to-right)
- `Flash` - Quick white flash transition (3 frames)
- `Cut` - Hard cut, no transition (0 frames)

Each transition component receives:
- `children`: The shot content
- `transitionDirection`: 'enter' | 'exit'
- `transitionProgress`: 0-1 value
- `durationInFrames`: Total frames for this shot

#### 1.2 Restructure ReelStudioVideo to Use TransitionSeries
Replace the current manual `crossfadeFrames` overlap approach with Remotion's `TransitionSeries`:

```tsx
<TransitionSeries>
  {shots.map((shot, index) => (
    <TransitionSeries.Sequence key={index} durationInFrames={shotDurationFrames}>
      <ShotContent shot={shot} />
    </TransitionSeries.Sequence>
  ))}
  
  {/* Transitions between shots */}
  {shots.slice(0, -1).map((shot, index) => (
    <TransitionSeries.Transition 
      key={`transition-${index}`}
      presentation={getTransitionPresentation(shot.transition)}
      timing={{ durationInFrames: getTransitionDuration(shot.transition, style) }}
    />
  ))}
</TransitionSeries>
```

#### 1.3 Map shot.transition to actual transitions
```
'crossfade' -> Crossfade (12 frames)
'cut'       -> Cut (0 frames)  
'wipe'      -> Wipe (15 frames)
default     -> Crossfade (12 frames)
```

### Phase 2: Style-Driven Rendering

Create a `StyleConfig` system that influences everything:

```typescript
interface StyleConfig {
  transitionDuration: number;    // How long transitions take
  defaultTransition: string;     // Default transition type
  filmGrainIntensity: number;    // 0-1 grain overlay opacity
  colorGrade: 'warm' | 'cool' | 'neutral';
  typography: 'bold' | 'elegant' | 'minimal';
  pacing: 'slow' | 'medium' | 'fast';
  vignetteIntensity: number;     // 0-1
  lightLeakEnabled: boolean;
}

const STYLE_CONFIGS = {
  cinematic: {
    transitionDuration: 18,
    defaultTransition: 'crossfade',
    filmGrainIntensity: 0.15,
    colorGrade: 'warm',
    typography: 'elegant',
    pacing: 'slow',
    vignetteIntensity: 0.4,
    lightLeakEnabled: true,
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
  },
};
```

Style also influences:
- Default template selection when shot.template is missing
- Shot duration multiplier (fast_cuts = 0.7x, cinematic = 1.2x)
- Music volume level
- Text animation style

### Phase 3: Intro/Outro Sequences

#### 3.1 Title Card Intro
- 2-second opening sequence before first shot
- Brief title with animated entrance (scale + fade from center)
- Subtitle: style name or date
- Background: gradient or blurred first shot
- Style-matched animation:
  - cinematic: slow zoom + elegant serif font
  - fast_cuts: quick flash reveal + bold sans-serif
  - minimal: fade in + light sans-serif

#### 3.2 End Card Outro
- 2-second closing sequence after last shot
- "Created with ReelStudio" or customizable CTA
- Background: gradient or blurred last shot
- Fade out to black

### Phase 4: Visual Effects

#### 4.1 Film Grain Overlay
- Use Remotion's `Noise` component
- Opacity controlled by style config
- Subtle animated grain for cinematic feel

#### 4.2 Color Grading
- Overlay semi-transparent color wash
- warm: amber/orange tint (#FFB347 at 8% opacity)
- cool: blue/teal tint (#47B3FF at 6% opacity)
- neutral: none

#### 4.3 Light Leak Effects
- Animated gradient overlay that sweeps across during transitions
- Only enabled for cinematic style
- Orange/pink/amber colors

#### 4.4 Improved Typography
- Better font stack with fallbacks
- Style-matched text animations:
  - cinematic: slow fade + slight scale
  - fast_cuts: quick slide up
  - minimal: opacity only
- Text shadow for readability
- Better positioning (lower third area)

### Phase 5: Audio Improvements

#### 5.1 Beat-Synced Cuts
- Pre-calculate beat positions from music BPM
- Align shot boundaries to nearest beat
- Fallback: current duration-based approach

#### 5.2 Audio Ducking
- Reduce music volume slightly when text captions appear
- Smooth ducking curve (not abrupt)

#### 5.3 Transition Sound Effects
- Subtle whoosh sounds for slide transitions
- Click sounds for cut transitions
- Volume: very low (-18dB) so they don't overpower music

---

## File Changes Summary

### New Files:
```
apps/renderer/src/transitions/
  Crossfade.tsx
  SlideLeft.tsx
  SlideRight.tsx
  ZoomIn.tsx
  ZoomOut.tsx
  Wipe.tsx
  Flash.tsx
  Cut.tsx
  index.ts

apps/renderer/src/effects/
  FilmGrain.tsx
  ColorGrade.tsx
  LightLeak.tsx
  index.ts

apps/renderer/src/components/
  TitleCard.tsx
  EndCard.tsx
  index.ts

apps/renderer/src/config/
  styles.ts
```

### Modified Files:
```
apps/renderer/src/compositions/ReelStudioVideo.tsx  (major rewrite)
apps/renderer/src/templates/TextOverlay.tsx          (improved typography)
apps/renderer/src/Root.tsx                           (duration adjustments for intro/outro)
```

---

## Implementation Order

1. **Transition components** (8 files) - Foundation
2. **Style config system** - Drives everything else  
3. **ReelStudioVideo rewrite** - Wire transitions + style together
4. **Visual effects** (grain, color grade, light leak)
5. **Title card + End card** - Intro/outro
6. **Typography improvements** - Better text rendering
7. **Audio improvements** - Ducking, SFX

## Testing Strategy
- Use Remotion Studio to preview changes live
- Test all 3 styles with sample brief
- Verify transitions work for all shot types
- Check aspect ratios (9:16, 1:1, 16:9)
- Verify audio levels are balanced
