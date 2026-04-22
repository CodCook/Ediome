import React, { useState, useRef } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { toast } from 'sonner';
import { ImageIcon, VideoIcon, Zap, CheckCircle, Info, Upload, Trash2 } from 'lucide-react';
import { MediaFile } from '@reelstudio/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const LibraryView = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: mediaFiles = [], mutate } = useSWR<MediaFile[]>('/api/media', fetcher, {
    refreshInterval: isAnalyzing ? 3000 : 0,
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${files.length} files...`);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      toast.success(`Successfully uploaded ${json.uploaded} files`, { id: toastId });
      mutate(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  const handleAnalyzeAll = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    toast.loading('Analyzing new media...', { id: 'analyze' });

    try {
      const res = await fetch('/api/analyze', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      toast.success(`Analyzed ${json.analyzed_count} files successfully.`, { id: 'analyze' });
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to analyze', { id: 'analyze' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteAll = async () => {
    if (mediaFiles.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete all ${mediaFiles.length} media files?`)) return;

    const toastId = toast.loading('Deleting all media...');
    try {
      const res = await fetch('/api/media', { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete all media');
      
      toast.success(`Successfully deleted ${json.deleted_count} media files`, { id: toastId });
      setSelectedMedia(null);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete all media', { id: toastId });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this media?')) return;

    const toastId = toast.loading('Deleting media...');
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete');
      
      toast.success('Media deleted successfully', { id: toastId });
      
      // Close the panel if the user deletes the currently viewed item
      if (selectedMedia?.id === id) {
        setSelectedMedia(null);
      }
      
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete', { id: toastId });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold">Library</h2>
          <p className="text-sm text-gray-400 font-mono mt-1">{mediaFiles.length} files total</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-[var(--color-rs-card)] border border-[var(--color-rs-border)] text-white px-4 py-2 rounded font-medium flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <Upload size={16} />
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </button>
          
          <button
            onClick={handleDeleteAll}
            disabled={mediaFiles.length === 0}
            className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-2 rounded font-medium flex items-center gap-2 hover:bg-red-900/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={16} />
            Delete All
          </button>

          <button
            onClick={handleAnalyzeAll}
            disabled={isAnalyzing || mediaFiles.length === 0}
            className="bg-[var(--color-rs-amber)] text-black px-4 py-2 rounded font-medium flex items-center gap-2 hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            <Zap size={16} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze All'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 overflow-y-auto pr-2 pb-20">
        {mediaFiles.map((file) => {
          let score = null;
          try {
            if (file.metadata_json) {
              const meta = JSON.parse(file.metadata_json);
              score = meta.quality_score;
            }
          } catch (e) {}

          return (
            <div
              key={file.id}
              onClick={() => setSelectedMedia(file)}
              className="bg-[var(--color-rs-card)] border border-[var(--color-rs-border)] rounded-lg overflow-hidden group cursor-pointer hover:border-[var(--color-rs-amber)] transition-colors relative aspect-square flex flex-col"
            >
              <div className="relative flex-grow bg-black">
                {/* Fallback pattern if Image fails (e.g. video missing thumbnail) */}
                <Image
                  src={file.public_path}
                  alt={file.filename}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <div className="bg-black/70 backdrop-blur-sm p-1.5 rounded-md text-[var(--color-rs-light)]">
                    {file.media_type === 'video' ? <VideoIcon size={14} /> : <ImageIcon size={14} />}
                  </div>
                </div>
                {score !== null && (
                  <div className={`absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md font-mono text-xs font-bold ${getScoreColor(score)}`}>
                    {score}/10
                  </div>
                )}
                
                {/* Delete button appears on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.id);
                  }}
                  className="absolute bottom-2 right-2 bg-black/70 hover:bg-red-900/90 backdrop-blur-sm p-1.5 rounded-md text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 transition-all z-10"
                  title="Delete media"
                >
                  <Trash2 size={14} />
                </button>

                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-mono capitalize flex items-center gap-1">
                  {file.status === 'analyzed' && <CheckCircle size={10} className="text-green-400" />}
                  {file.status === 'error' && <Info size={10} className="text-red-400" />}
                  {file.status === 'new' && <Zap size={10} className="text-[var(--color-rs-amber)]" />}
                  {file.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over panel for metadata */}
      {selectedMedia && (
        <div className="fixed inset-y-0 right-0 w-96 bg-[var(--color-rs-card)] border-l border-[var(--color-rs-border)] shadow-2xl z-50 p-6 flex flex-col overflow-y-auto animate-in slide-in-from-right">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold truncate pr-4">{selectedMedia.filename}</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleDelete(selectedMedia.id)} 
                className="text-gray-400 hover:text-red-400 p-1 rounded-md hover:bg-white/5 transition-colors"
                title="Delete media"
              >
                <Trash2 size={18} />
              </button>
              <button 
                onClick={() => setSelectedMedia(null)} 
                className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
                title="Close panel"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="relative w-full aspect-video bg-black rounded border border-[var(--color-rs-border)] overflow-hidden mb-6">
            <Image src={selectedMedia.public_path} alt="Preview" fill className="object-contain" unoptimized />
          </div>

          <div className="space-y-4 font-mono text-sm">
            <div>
              <div className="text-gray-500 mb-1">ID</div>
              <div>{selectedMedia.id}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Status</div>
              <div className="capitalize">{selectedMedia.status}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Type</div>
              <div className="capitalize">{selectedMedia.media_type}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Added</div>
              <div>{new Date(selectedMedia.created_at).toLocaleString()}</div>
            </div>
            
            {selectedMedia.metadata_json && (
              <div className="mt-8 pt-6 border-t border-[var(--color-rs-border)]">
                <div className="text-[var(--color-rs-amber)] font-bold mb-4 uppercase tracking-wider text-xs">AI Analysis</div>
                <pre className="bg-[#111] p-4 rounded text-xs overflow-x-auto text-gray-300 border border-[var(--color-rs-border)]">
                  {JSON.stringify(JSON.parse(selectedMedia.metadata_json), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedMedia(null)} />
      )}
    </div>
  );
};
