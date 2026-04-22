import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Audio,
  interpolate,
  useVideoConfig,
  useCurrentFrame,
  Easing,
} from 'remotion';
import { VideoBrief, Shot } from '@reelstudio/types';
import { FadeSlide } from '../templates/FadeSlide';
import { KenBurns } from '../templates/KenBurns';
import { ZoomIn } from '../templates/ZoomIn';
import { SplitReveal } from '../templates/SplitReveal';
import { TextOverlay } from '../templates/TextOverlay';
import { getStyleConfig } from '../config/styles';
import { TitleCard } from '../components/TitleCard';
import { EndCard } from '../components/EndCard';
import { FilmGrain } from '../effects/FilmGrain';
import { ColorGrade } from '../effects/ColorGrade';
import { LightLeak } from '../effects/LightLeak';

const TITLE_CARD_SECONDS = 2;
const END_CARD_SECONDS = 2;

type TransitionType =
  | 'crossfade'
  | 'slide_left'
  | 'slide_right'
  | 'zoom_in'
  | 'zoom_out'
  | 'wipe'
  | 'flash'
  | 'cut';

interface ShotContentProps {
  shot: Shot;
  styleConfig: ReturnType<typeof getStyleConfig>;
}

const ShotContent: React.FC<ShotContentProps> = ({ shot, styleConfig }) => {
  const src = shot.public_path
    ? `http://localhost:3000${shot.public_path}`
    : `http://localhost:3000/media/${shot.media_file_id}.jpg`;

  const getTemplate = () => {
    switch (shot.template) {
      case 'fade_slide':
        return <FadeSlide src={src} noFade />;
      case 'ken_burns':
        return <KenBurns src={src} noFade />;
      case 'zoom_in':
        return <ZoomIn src={src} />;
      case 'split_reveal':
        return <SplitReveal src={src} />;
      default:
        return <FadeSlide src={src} noFade />;
    }
  };

  return (
    <TextOverlay text={shot.caption} styleConfig={styleConfig}>
      {getTemplate()}
    </TextOverlay>
  );
};

interface TransitionWrapperProps {
  children: React.ReactNode;
  transitionType: TransitionType;
  transitionDurationFrames: number;
  shotDurationFrames: number;
  isLastShot: boolean;
}

const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  transitionType,
  transitionDurationFrames,
  shotDurationFrames,
  isLastShot,
}) => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(
    frame,
    [0, transitionDurationFrames],
    [0, 1],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) }
  );

  const enterTranslateX = interpolate(
    frame,
    [0, transitionDurationFrames],
    [100, 0],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) }
  );

  const enterTranslateXReverse = interpolate(
    frame,
    [0, transitionDurationFrames],
    [-100, 0],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) }
  );

  const enterScale = interpolate(
    frame,
    [0, transitionDurationFrames],
    [1.5, 1],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) }
  );

  const enterScaleOut = interpolate(
    frame,
    [0, transitionDurationFrames],
    [0.5, 1],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) }
  );

  const wipeProgress = interpolate(
    frame,
    [0, transitionDurationFrames],
    [0, 100],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) }
  );

  const flashPeak = Math.min(3, Math.floor(transitionDurationFrames / 2));
  const flashOpacity = interpolate(
    frame,
    [0, flashPeak, transitionDurationFrames],
    [1, 0, 0],
    { extrapolateRight: 'clamp' }
  );

  const getEnterStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
    };

    switch (transitionType) {
      case 'crossfade':
        return { ...base, opacity: enterOpacity };
      case 'slide_left':
        return { ...base, opacity: enterOpacity, transform: `translateX(${enterTranslateX}%)` };
      case 'slide_right':
        return { ...base, opacity: enterOpacity, transform: `translateX(${enterTranslateXReverse}%)` };
      case 'zoom_in':
        return { ...base, opacity: enterOpacity, transform: `scale(${enterScale})` };
      case 'zoom_out':
        return { ...base, opacity: enterOpacity, transform: `scale(${enterScaleOut})` };
      case 'wipe':
        return { ...base, clipPath: `polygon(0 0, ${wipeProgress}% 0, ${wipeProgress}% 100%, 0 100%)` };
      case 'flash':
        return { ...base, opacity: enterOpacity };
      case 'cut':
      default:
        return base;
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <div style={getEnterStyle()}>
        {children}
      </div>
      {transitionType === 'flash' && (
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
      )}
    </AbsoluteFill>
  );
};

export const ReelStudioVideo: React.FC<VideoBrief> = (props) => {
  const { shots, has_music, music_mood, title, style } = props;
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const styleConfig = getStyleConfig(style || 'cinematic');

  const titleCardFrames = Math.round(TITLE_CARD_SECONDS * fps);
  const endCardFrames = Math.round(END_CARD_SECONDS * fps);

  const shotDurations = shots.map((shot) => {
    const baseFrames = Math.round(shot.duration * fps);
    return Math.round(baseFrames * styleConfig.durationMultiplier);
  });

  const transitionDurationFrames = styleConfig.transitionDuration;

  let currentFrameStart = titleCardFrames;

  const shotSequences = shots.map((shot, index) => {
    const startFrame = currentFrameStart;
    const shotDurationFrames = shotDurations[index];

    currentFrameStart += shotDurationFrames - transitionDurationFrames;

    const transitionType = (shot.transition as TransitionType) || (styleConfig.defaultTransition as TransitionType);

    return {
      shot,
      startFrame,
      shotDurationFrames,
      transitionType,
      isLastShot: index === shots.length - 1,
    };
  });

  const totalShotFrames = shotDurations.reduce((a, b) => a + b, 0);
  const totalTransitionOverlap = shots.length > 1 ? (shots.length - 1) * transitionDurationFrames : 0;
  const endCardStart = titleCardFrames + totalShotFrames - totalTransitionOverlap;

  const baseAudioVolume = styleConfig.pacing === 'fast' ? 0.5 : styleConfig.pacing === 'slow' ? 0.6 : 0.55;

  const totalFrames = endCardStart + endCardFrames;

  const audioVolume = interpolate(
    frame,
    [0, 30, totalFrames - 30, totalFrames],
    [0, baseAudioVolume, baseAudioVolume, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Sequence from={0} durationInFrames={titleCardFrames}>
        <TitleCard title={title || ''} styleConfig={styleConfig} />
      </Sequence>

      {shotSequences.map(({ shot, startFrame, shotDurationFrames, transitionType, isLastShot }) => (
        <Sequence
          key={`${shot.media_file_id}-${startFrame}`}
          from={startFrame}
          durationInFrames={shotDurationFrames}
        >
          <TransitionWrapper
            transitionType={transitionType}
            transitionDurationFrames={transitionDurationFrames}
            shotDurationFrames={shotDurationFrames}
            isLastShot={isLastShot}
          >
            <ShotContent shot={shot} styleConfig={styleConfig} />
          </TransitionWrapper>
        </Sequence>
      ))}

      <Sequence from={endCardStart} durationInFrames={endCardFrames}>
        <EndCard styleConfig={styleConfig} />
      </Sequence>

      {styleConfig.filmGrainIntensity > 0 && <FilmGrain intensity={styleConfig.filmGrainIntensity} />}
      {styleConfig.colorGrade !== 'neutral' && <ColorGrade type={styleConfig.colorGrade} />}
      {styleConfig.lightLeakEnabled && <LightLeak />}

      {has_music && <Audio src={`http://localhost:3000/music/${music_mood}.mp3`} volume={audioVolume} />}
    </AbsoluteFill>
  );
};
