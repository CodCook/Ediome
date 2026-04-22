import { Composition, getInputProps } from 'remotion';
import { ReelStudioVideo } from './compositions/ReelStudioVideo';
import { VideoBrief } from '@reelstudio/types';
import { getStyleConfig } from './config/styles';

export const Root: React.FC = () => {
  const inputProps = getInputProps() as Partial<VideoBrief>;

  const defaultBrief: VideoBrief = {
    id: 'preview-123',
    title: 'Preview Video',
    style: 'cinematic',
    music_mood: 'upbeat',
    has_music: true,
    aspect_ratio: '9:16',
    duration_seconds: 15,
    shots: [
      { media_file_id: 1, duration: 5, template: 'zoom_in', caption: 'Welcome to ReelStudio', transition: 'crossfade' },
      { media_file_id: 2, duration: 5, template: 'ken_burns', caption: 'Beautiful shots', transition: 'crossfade' },
      { media_file_id: 3, duration: 5, template: 'split_reveal', transition: 'crossfade' }
    ]
  };

  const brief = { ...defaultBrief, ...inputProps } as VideoBrief;

  const [width, height] = brief.aspect_ratio === '9:16' ? [1080, 1920] :
                          brief.aspect_ratio === '1:1' ? [1080, 1080] :
                          [1920, 1080];

  const styleConfig = getStyleConfig(brief.style || 'cinematic');
  const titleCardFrames = 2 * 30;
  const endCardFrames = 2 * 30;

  const totalShotFrames = brief.shots.reduce((sum, shot) => {
    return sum + Math.round(shot.duration * 30 * styleConfig.durationMultiplier);
  }, 0);

  const totalTransitionFrames = (brief.shots.length - 1) * styleConfig.transitionDuration;

  const durationInFrames = Math.max(1, titleCardFrames + totalShotFrames + totalTransitionFrames + endCardFrames);

  return (
    <>
      <Composition
        id="ReelStudioVideo"
        component={ReelStudioVideo as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={durationInFrames}
        fps={30}
        width={width}
        height={height}
        defaultProps={brief}
      />
    </>
  );
};
