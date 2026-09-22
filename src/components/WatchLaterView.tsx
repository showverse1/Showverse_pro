import React, { useState } from 'react';
import { Bookmark, Heart, Play, Trash2, Film, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WatchLaterView: React.FC = () => {
  const { user, videos, playVideo, removeFromWatchLater, toggleFavorite, setActiveTab } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'watchLater' | 'favorites'>('watchLater');

  const watchLaterVideos = videos.filter(v => user.watchLater.includes(v.id));
  const favoriteVideos = videos.filter(v => user.favorites.includes(v.id));

  const currentList = activeSubTab === 'watchLater' ? watchLaterVideos : favoriteVideos;

  const handlePlayAll = () => {
    if (currentList.length > 0) {
      playVideo(currentList[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              My Saved Library
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Manage your personal bookmark queue and favorite cinematic titles.
          </p>
        </div>

        {/* Sub-tabs: Watch Later vs Favorites */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              onClick={() => setActiveSubTab('watchLater')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'watchLater'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watch Later ({watchLaterVideos.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('favorites')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'favorites'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Favorites ({favoriteVideos.length})</span>
            </button>
          </div>

          {currentList.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play All</span>
            </button>
          )}
        </div>
      </div>

      {/* Videos List / Grid */}
      <div className="py-6">
        {currentList.length === 0 ? (
          <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Film className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Your list is empty</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {activeSubTab === 'watchLater'
                ? 'Save shows, movies, and verses to watch whenever you are ready.'
                : 'Like your favorite content to easily access it here anytime.'}
            </p>
            <button
              onClick={() => setActiveTab('home')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20"
            >
              <span>Explore Library</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentList.map((video) => (
              <div
                key={video.id}
                className="group relative flex flex-col rounded-xl overflow-hidden bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all"
              >
                {/* Thumbnail */}
                <div 
                  className="relative aspect-video w-full overflow-hidden bg-zinc-950 cursor-pointer"
                  onClick={() => playVideo(video)}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-zinc-950 ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-zinc-200">
                    {video.formattedDuration}
                  </span>
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950">
                    {video.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-3.5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 
                      onClick={() => playVideo(video)}
                      className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer font-['Outfit']"
                    >
                      {video.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                      {video.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-800 text-xs">
                    <span className="text-[11px] text-zinc-400">{video.creatorName}</span>
                    
                    <div className="flex items-center gap-1">
                      {activeSubTab === 'watchLater' ? (
                        <button
                          onClick={() => removeFromWatchLater(video.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                          title="Remove from Watch Later"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleFavorite(video.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                          title="Unlike"
                        >
                          <Heart className="w-4 h-4 fill-rose-500" />
                        </button>
                      )}

                      <button
                        onClick={() => playVideo(video)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold text-[11px]"
                      >
                        Play
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
