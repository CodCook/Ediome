import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { BriefOptions, VideoBrief, MediaFile, MediaAnalysis } from '@reelstudio/types';
import { Layers, Wand2, Sparkles } from 'lucide-react';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const EXPORT_PRESETS = [
  { id: 'instagram_reels', name: 'Instagram Reels', aspect_ratio: '9:16', style: 'fast_cuts', max_shots: 15 },
  { id: 'tiktok', name: 'TikTok', aspect_ratio: '9:16', style: 'fast_cuts', max_shots: 12 },
  { id: 'linkedin', name: 'LinkedIn', aspect_ratio: '16:9', style: 'cinematic', max_shots: 10 },
  { id: 'instagram_feed', name: 'Instagram Feed', aspect_ratio: '1:1', style: 'minimal', max_shots: 8 },
] as const;

export const BriefBuilderView = () => {
  const { data: mediaFiles = [] } = useSWR<MediaFile[]>('/api/media', fetcher);
  
  const [options, setOptions] = useState<BriefOptions>({
    aspect_ratio: '9:16',
    style: 'cinematic',
    max_shots: 10,
  });

  const [suggestedRatio, setSuggestedRatio] = useState<string | null>(null);
  const [suggestedMood, setSuggestedMood] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [brief, setBrief] = useState<VideoBrief | null>(null);

  // Compute smart defaults based on analyzed media
  useEffect(() => {
    const analyzed = mediaFiles.filter((m) => m.status === 'analyzed' && m.metadata_json);
    if (analyzed.length === 0) return;

    let portraits = 0;
    let landscapes = 0;
    let squares = 0;
    const moodCounts: Record<string, number> = {};

    analyzed.forEach((m) => {
      try {
        const meta = JSON.parse(m.metadata_json!) as MediaAnalysis;
        if (meta.orientation === 'portrait') portraits++;
        else if (meta.orientation === 'landscape') landscapes++;
        else squares++;

        if (meta.mood) {
          moodCounts[meta.mood] = (moodCounts[meta.mood] || 0) + 1;
        }
      } catch (e) {}
    });

    const total = analyzed.length;
    if (portraits / total > 0.6) setSuggestedRatio('9:16');
    else if (landscapes / total > 0.6) setSuggestedRatio('16:9');
    else setSuggestedRatio('1:1');

    if (Object.keys(moodCounts).length > 0) {
      const topMood = Object.entries(moodCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
      setSuggestedMood(topMood);
    }
  }, [mediaFiles]);

  const applyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    if (!presetId) return;
    
    const preset = EXPORT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setOptions({
        aspect_ratio: preset.aspect_ratio as any,
        style: preset.style as any,
        max_shots: preset.max_shots
      });
      toast.success(`Applied ${preset.name} preset`);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    toast.loading('Generating video brief...', { id: 'brief' });

    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBrief(data);
      toast.success('Brief generated!', { id: 'brief' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate brief', { id: 'brief' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col xl:flex-row gap-8 overflow-hidden">
      {/* Settings Panel */}
      <div className="w-full xl:w-96 flex-shrink-0 bg-[var(--color-rs-card)] p-6 rounded-xl border border-[var(--color-rs-border)] flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Layers className="text-[var(--color-rs-amber)]" />
            Brief Builder
          </h2>
          <p className="text-sm text-gray-400 mt-2">Configure settings to generate a new AI-directed video sequence.</p>
        </div>

        {suggestedMood && (
          <div className="bg-amber-900/20 border border-[var(--color-rs-amber)]/30 rounded-lg p-3 flex items-center gap-3">
            <Sparkles className="text-[var(--color-rs-amber)] flex-shrink-0" size={16} />
            <div className="text-xs text-amber-200/80">
              <strong className="text-[var(--color-rs-amber)]">Smart Insight:</strong> Your media is predominantly <span className="capitalize text-white">"{suggestedMood}"</span>.
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Export Preset</label>
          <select 
            value={selectedPreset} 
            onChange={(e) => applyPreset(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[var(--color-rs-border)] rounded-lg p-3 text-white appearance-none focus:outline-none focus:border-[var(--color-rs-amber)]"
          >
            <option value="">Custom Setup</option>
            {EXPORT_PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Aspect Ratio</label>
          <div className="flex gap-3 h-24">
            {(['9:16', '1:1', '16:9'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => {
                  setOptions({ ...options, aspect_ratio: ratio });
                  setSelectedPreset('');
                }}
                className={`relative flex-1 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                  options.aspect_ratio === ratio ? 'border-[var(--color-rs-amber)] bg-amber-900/20 text-[var(--color-rs-amber)]' : 'border-[var(--color-rs-border)] hover:border-gray-500 text-gray-400'
                }`}
              >
                <div className={`border-2 border-current rounded mb-2 ${
                  ratio === '9:16' ? 'w-4 h-8' : ratio === '1:1' ? 'w-6 h-6' : 'w-8 h-4'
                }`} />
                {suggestedRatio === ratio && (
                  <span className="absolute top-1 text-[8px] uppercase tracking-widest font-bold text-[var(--color-rs-amber)]">Suggested</span>
                )}
                <span className="text-xs font-mono">{ratio}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Style</label>
          <div className="flex flex-col gap-2">
            {(['cinematic', 'fast_cuts', 'minimal'] as const).map((style) => (
              <button
                key={style}
                onClick={() => {
                  setOptions({ ...options, style });
                  setSelectedPreset('');
                }}
                className={`px-4 py-3 rounded-lg border text-left capitalize transition-colors ${
                  options.style === style ? 'border-[var(--color-rs-amber)] bg-amber-900/20 text-[var(--color-rs-amber)]' : 'border-[var(--color-rs-border)] hover:border-gray-500 text-gray-400'
                }`}
              >
                {style.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Max Shots</label>
            <span className="font-mono text-[var(--color-rs-amber)]">{options.max_shots}</span>
          </div>
          <input
            type="range"
            min={5}
            max={20}
            value={options.max_shots}
            onChange={(e) => {
              setOptions({ ...options, max_shots: parseInt(e.target.value) });
              setSelectedPreset('');
            }}
            className="w-full accent-[var(--color-rs-amber)] cursor-pointer"
          />
        </div>

        <div className="flex-grow min-h-[1rem]" />

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-[var(--color-rs-amber)] text-black py-4 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-amber-400 disabled:opacity-50 flex-shrink-0"
        >
          <Wand2 size={20} />
          {isGenerating ? 'Drafting...' : 'Generate Brief'}
        </button>
      </div>

      {/* Timeline Panel */}
      <div className="flex-grow bg-[#0a0a0a] rounded-xl border border-[var(--color-rs-border)] overflow-hidden flex flex-col relative min-w-0">
        {!brief ? (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-500 gap-4 p-8 text-center">
            <Wand2 size={48} className="opacity-20" />
            <p>Generate a brief to see the timeline.</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-[var(--color-rs-border)] bg-[var(--color-rs-card)] flex justify-between items-end flex-shrink-0">
              <div>
                <div className="text-xs font-mono text-[var(--color-rs-amber)] mb-2">{brief.id}</div>
                <h2 className="text-2xl font-bold">{brief.title}</h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400 font-mono">
                  <span>Duration: {brief.duration_seconds}s</span>
                  <span>Shots: {brief.shots.length}</span>
                  <span className="flex items-center gap-1">Mood: <span className="text-white capitalize">{brief.music_mood}</span></span>
                  {brief.has_music && <span className="text-green-400 text-xs flex items-center">🎵 Beat Synced</span>}
                </div>
              </div>
            </div>
            
            <div className="flex-grow overflow-x-auto p-8 flex gap-4 items-center">
              {brief.shots.map((shot, i) => (
                <div key={i} className="flex flex-col gap-3 min-w-[200px] flex-shrink-0 relative group h-full justify-center">
                  <div className="text-xs font-mono text-gray-500 flex justify-between">
                    <span>{i + 1}</span>
                    <span>{shot.duration}s</span>
                  </div>
                  
                  <div className={`relative rounded-lg overflow-hidden border-2 border-[var(--color-rs-border)] group-hover:border-[var(--color-rs-amber)] transition-colors bg-black ${
                    brief.aspect_ratio === '9:16' ? 'aspect-[9/16]' : brief.aspect_ratio === '1:1' ? 'aspect-square' : 'aspect-video'
                  }`}>
                    {/* Note: In a real app we'd fetch the actual media file path by ID here, 
                        using a placeholder path that assumes the web server serves it */}
                    <Image
                      src={`/media/${shot.media_file_id}`}
                      alt="Shot"
                      fill
                      className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      unoptimized
                    />
                    
                    <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
                      <div className="self-end bg-black/80 px-2 py-1 rounded text-[10px] font-mono text-[var(--color-rs-amber)]">
                        {shot.template}
                      </div>
                      
                      {shot.caption && (
                        <div className="bg-black/80 px-3 py-2 rounded-md text-sm font-bold text-center border border-white/10 text-white">
                          "{shot.caption}"
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-center text-gray-500 capitalize">
                    {shot.transition}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
