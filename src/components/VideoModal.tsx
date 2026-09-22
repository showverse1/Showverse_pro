import React from 'react';
import { X, Play, Plus, Check, Heart, Star, Film, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VideoModal: React.FC = () => {
  const { 
    selectedModalVideo, 
    setSelectedModalVideo, 
    playVideo, 
    toggleWatchLater, 
    isInWatchLater, 
    isFavorite, 
    toggleFavorite 
  } = useApp();

  if (!selectedModalVideo) return null;

  const inWatchLater = isInWatchLater(selectedModalVideo.id);
  const isFav = isFavorite(selectedModalVideo.id);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={() => setSelectedModalVideo(null)}
    >
      <div 
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedModalVideo(null)}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/70 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Banner Header */}
        <div className="relative aspect-video w-full bg-zinc-950">
          <img
            src={selectedModalVideo.banner || selectedModalVideo.thumbnail}
            alt={selectedModalVideo.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="space-y-1 max-w-md">
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold uppercase tracking-wider">
                {selectedModalVideo.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] drop-shadow">
                {selectedModalVideo.title}
              </h2>
            </div>

            <button
              onClick={() => {
                setSelectedModalVideo(null);
                playVideo(selectedModalVideo);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/30"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>Play Now</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{selectedModalVideo.rating.toFixed(1)}</span>
            </div>
            <span>•</span>
            <span>{selectedModalVideo.releaseYear}</span>
            <span>•</span>
            <span>{selectedModalVideo.formattedDuration}</span>
            <span>•</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 font-mono font-semibold">
              {selectedModalVideo.quality}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
              {selectedModalVideo.ageRating}
            </span>
          </div>

          {/* Tagline & Description */}
          {selectedModalVideo.tagline && (
            <p className="text-zinc-200 font-semibold italic text-sm">
              "{selectedModalVideo.tagline}"
            </p>
          )}

          <p className="text-zinc-300 leading-relaxed">
            {selectedModalVideo.description}
          </p>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => toggleWatchLater(selectedModalVideo.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                inWatchLater
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                  : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {inWatchLater ? <Check className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4" />}
              <span>{inWatchLater ? 'In Watch Later' : 'Add to Watch Later'}</span>
            </button>

            <button
              onClick={() => toggleFavorite(selectedModalVideo.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                isFav
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/40'
                  : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-400' : ''}`} />
              <span>{isFav ? 'Favorited' : 'Favorite'}</span>
            </button>
          </div>

          {/* Creator & Tags */}
          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <img
                src={selectedModalVideo.creatorAvatar}
                alt={selectedModalVideo.creatorName}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-zinc-400">
                Created by <strong className="text-white">{selectedModalVideo.creatorName}</strong>
              </span>
            </div>

            {selectedModalVideo.tags && selectedModalVideo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedModalVideo.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
