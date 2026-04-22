export type MediaType = 'photo' | 'video';
export type MediaStatus = 'new' | 'analyzed' | 'used' | 'error';

export interface MediaAnalysis {
  scene_description: string;
  mood: string;
  quality_score: number;
  dominant_colors: string[];
  has_people: boolean;
  suggested_caption: string;
  width?: number;
  height?: number;
  orientation?: 'portrait' | 'landscape' | 'square';
}

export interface MediaFile {
  id: number;
  filename: string;
  file_path: string;
  public_path: string;
  media_type: MediaType;
  status: MediaStatus;
  created_at: string;
  metadata_json: string | null;
}

export interface Shot {
  media_file_id: number;
  template: string;
  duration: number;
  caption?: string;
  transition: string;
  public_path?: string;
}

export interface VideoBrief {
  id: string;
  title: string;
  style: string;
  shots: Shot[];
  music_mood: string;
  has_music: boolean;
  aspect_ratio: string;
  duration_seconds: number;
}

export interface BriefOptions {
  aspect_ratio: '9:16' | '1:1' | '16:9';
  style: 'cinematic' | 'fast_cuts' | 'minimal';
  max_shots: number;
}
