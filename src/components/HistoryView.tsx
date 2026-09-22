import React from 'react';
import { History, Play, Trash2, RotateCcw, ArrowRight, Film } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HistoryView: React.FC = () => {
  const { user, videos, playVideo, clearHistory, setActiveTab } = useApp();

  const historyItems = user.history;
  const historyVideos = historyItems
    .map(h => {
      const video = videos.find(v => v.id === h.videoId);
      return video ? { ...video, historyData: h } : null;
    })
    .filter(Boolean);

  const formatSeconds = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              Watch History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Pick up right where you left off across all your devices.
          </p>
        </div>

        {historyVideos.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-rose-400 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Watch History</span>
          </button>
        )}
      </div>

      {/* History Items */}
      <div className="py-6">
        {historyVideos.length === 0 ? (
          <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Film className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">No viewing history yet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Videos and verses you watch will automatically remember your exact stopping point here.
            </p>
            <button
              onClick={() => setActiveTab('home')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20"
            >
              <span>Discover Videos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {historyVideos.map((item: any) => {
              const progressPct = Math.round(item.historyData.progress * 100);
              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Thumbnail with progress overlay */}
                    <div 
                      className="relative w-36 sm:w-44 aspect-video rounded-lg overflow-hidden bg-zinc-950 shrink-0 cursor-pointer group"
                      onClick={() => playVideo(item)}
                    >
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-6 h-6 text-amber-400 fill-amber-400" />
                      </div>
                      
                      {/* Progress bar */}
                      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-zinc-800">
                        <div className="h-full bg-amber-500" style={{ width: `${progressPct}%` }} />
                      </div>

                      <span className="absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/80 text-zinc-200">
                        {item.formattedDuration}
                      </span>
                    </div>

                    {/* Details */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {item.category}
                      </span>
                      <h4 
                        onClick={() => playVideo(item)}
                        className="text-sm font-bold text-white hover:text-amber-400 transition-colors cursor-pointer line-clamp-1 font-['Outfit']"
                      >
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                      <p className="text-xs text-zinc-500 font-mono mt-1">
                        Watched to {formatSeconds(item.historyData.currentTime)} ({progressPct}%)
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => playVideo(item)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
