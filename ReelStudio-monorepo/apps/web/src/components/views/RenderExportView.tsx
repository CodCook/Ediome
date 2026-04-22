import React, { useState } from 'react';
import useSWR from 'swr';
import { Play, Download, Terminal, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const LiveRenderStatus = ({ jobId }: { jobId: string }) => {
  const { data: job, error } = useSWR(`/api/render/${jobId}`, fetcher, { refreshInterval: 2000 });

  if (error) return <div className="text-red-500 font-mono text-sm p-4">Error loading job status</div>;
  if (!job) return <div className="text-gray-500 font-mono text-sm p-4 animate-pulse">Loading job...</div>;

  const isDone = job.status === 'done';
  const isFailed = job.status === 'failed';

  return (
    <div className="flex flex-col gap-4 bg-[#0a0a0a] rounded-lg p-6 border border-[var(--color-rs-border)] animate-in fade-in-0 duration-500">
      <div className="flex items-center justify-between border-b border-[var(--color-rs-border)] pb-4">
        <div className="flex items-center gap-3">
          {isDone ? <CheckCircle2 className="text-green-400" /> : isFailed ? <XCircle className="text-red-400" /> : <Loader2 className="text-[var(--color-rs-amber)] animate-spin" />}
          <div className="flex flex-col">
            <span className="font-bold text-lg capitalize">{job.status}</span>
            <span className="font-mono text-xs text-gray-500">{jobId}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 font-mono flex items-center justify-end gap-1">
            <Clock size={12} />
            {new Date(job.started_at).toLocaleTimeString()}
          </div>
          {job.finished_at && (
            <div className="text-xs text-gray-500 font-mono mt-1">
              Finished: {new Date(job.finished_at).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <div className="bg-black rounded-md font-mono text-xs p-4 border border-[var(--color-rs-border)] relative">
        <div className="absolute top-2 right-2 text-gray-600 flex items-center gap-1">
          <Terminal size={12} /> stdout
        </div>
        <pre className="text-green-500 h-64 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed mt-4">
          {job.logTail || 'Awaiting logs...'}
        </pre>
      </div>

      {isDone && (
        <a
          href={`/api/render/${jobId}/download`}
          download
          className="bg-[var(--color-rs-amber)] text-black px-6 py-3 rounded font-bold text-center flex justify-center items-center gap-2 hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(239,159,39,0.3)] mt-2"
        >
          <Download size={20} />
          Download Rendered MP4
        </a>
      )}
    </div>
  );
};

export const RenderExportView = () => {
  const { data: briefs = [], mutate } = useSWR<any[]>('/api/briefs', fetcher);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const handleClearQueue = async () => {
    if (!confirm('Are you sure you want to clear all queued render jobs? This will not affect completed or failed renders.')) return;

    const toastId = toast.loading('Clearing render queue...');
    try {
      const res = await fetch('/api/render', { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to clear queue');
      
      toast.success(`Cleared ${json.cleared_count} queued jobs`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to clear queue', { id: toastId });
    }
  };

  const handleRender = async (briefId: string) => {
    toast.loading('Queueing render job...', { id: `render-${briefId}` });
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Render job started', { id: `render-${briefId}` });
      setActiveJobId(data.jobId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to start render', { id: `render-${briefId}` });
    }
  };

  return (
    <div className="p-6 h-full flex flex-col xl:flex-row gap-8">
      <div className="w-full xl:w-1/3 flex-shrink-0 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Render Queue</h2>
            <p className="text-sm text-gray-400 mt-2">Select a generated brief to render via Remotion.</p>
          </div>
          <button
            onClick={handleClearQueue}
            className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-2 rounded font-medium flex items-center gap-2 hover:bg-red-900/70 transition-colors"
          >
            Clear Queue
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-3">
          {briefs.length === 0 ? (
            <div className="text-gray-500 font-mono text-sm border border-dashed border-[var(--color-rs-border)] rounded-lg p-6 text-center">
              No briefs generated yet.
            </div>
          ) : (
            briefs.map((brief) => (
              <div key={brief.id} className="bg-[var(--color-rs-card)] p-5 rounded-lg border border-[var(--color-rs-border)] hover:border-gray-600 transition-colors group flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold truncate pr-4" title={brief.title}>{brief.title}</h3>
                    <div className="bg-black/50 px-2 py-1 rounded text-[10px] font-mono text-[var(--color-rs-amber)] border border-amber-900/50">
                      {brief.style}
                    </div>
                  </div>
                  <div className="font-mono text-xs text-gray-500 mt-2 flex gap-3">
                    <span>{brief.aspect_ratio}</span>
                    <span>{brief.duration_seconds}s</span>
                    <span>{new Date(brief.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRender(brief.id)}
                  className="bg-white/5 hover:bg-[var(--color-rs-amber)] hover:text-black text-white px-4 py-2 rounded text-sm font-bold flex justify-center items-center gap-2 transition-colors w-full"
                >
                  <Play size={16} className={activeJobId ? 'opacity-50' : ''} />
                  Render Video
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-grow">
        {activeJobId ? (
          <LiveRenderStatus jobId={activeJobId} />
        ) : (
          <div className="h-full border border-dashed border-[var(--color-rs-border)] rounded-lg flex flex-col items-center justify-center text-gray-500 gap-4 p-8">
            <Terminal size={48} className="opacity-20" />
            <p>Select a brief to begin the render process.</p>
          </div>
        )}
      </div>
    </div>
  );
};
