import React from 'react';
import { Play, Plus, Check, Heart, MoreVertical, Star, Flame } from 'lucide-react';
import { Video } from '../types';
import { useApp } from '../context/AppContext';

interface VideoCardProps {
  video: Video;
  layout?: 'grid' | 'row';
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, layout = 'grid' }) => {
  const { 
    playVideo, 
    toggleWatchLater, 
    isInWatchLater, 
    isFavorite, 
    toggleFavorite, 
    getWatchProgress, 
    setSelectedModalVideo 
  } = useApp();

  const inWatchLater = isInWatchLater(video.id);
  const isFav = isFavorite(video.id);
  const progressItem = getWatchProgress(video.id);

  return (
    <div 
      className="group relative flex flex-col rounded-xl overflow-hidden bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/50"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950 cursor-pointer" onClick={() => playVideo(video)}>
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Hover play button */}
        <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/40 transform scale-75 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-6 h-6 fill-zinc-950 ml-0.5" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {video.isVerse && (
            <span className="flex items-center gap-1 text-[10px] uppercase font-black px-2 py-0.5 rounded bg-rose-600 text-white shadow">
              <Flame className="w-3 h-3 fill-white" />
              Verse
            </span>
          )}
          {video.isOriginal && !video.isVerse && (
            <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 shadow">
              Original
            </span>
          )}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-900/90 text-zinc-200 border border-zinc-800 backdrop-blur-xs">
            {video.quality}
          </span>
        </div>

        {/* Duration pill */}
        <div className="absolute bottom-2.5 right-2.5 bg-zinc-950/80 backdrop-blur-xs text-[11px] font-mono font-medium px-2 py-0.5 rounded text-zinc-200 border border-zinc-800/80">
          {video.formattedDuration}
        </div>

        {/* Watch Progress bar (if exists) */}
        {progressItem && progressItem.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
            <div 
              className="h-full bg-amber-500" 
              style={{ width: `${Math.round(progressItem.progress * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="text-amber-400 font-semibold">{video.category}</span>
            <div className="flex items-center gap-1 text-zinc-300 font-mono">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{video.rating.toFixed(1)}</span>
              <span className="text-zinc-500">•</span>
              <span>{video.releaseYear}</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => playVideo(video)}
            className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer font-['Outfit']"
            title={video.title}
          >
            {video.title}
          </h3>

          {/* Tagline or Description preview */}
          <p className="text-xs text-zinc-400 line-clamp-1 mt-1">
            {video.tagline || video.description}
          </p>
        </div>

        {/* Bottom Actions row */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-800/60 text-xs">
          <div className="flex items-center gap-2">
            <img 
              src={video.creatorAvatar} 
              alt={video.creatorName} 
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-zinc-400 truncate max-w-[110px] text-[11px]">
              {video.creatorName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleFavorite(video.id)}
              className={`p-1.5 rounded-md hover:bg-zinc-800 transition-colors ${
                isFav ? 'text-rose-500' : 'text-zinc-400 hover:text-white'
              }`}
              title={isFav ? 'Liked' : 'Like'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => toggleWatchLater(video.id)}
              className={`p-1.5 rounded-md hover:bg-zinc-800 transition-colors ${
                inWatchLater ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
              }`}
              title={inWatchLater ? 'In Watch Later' : 'Add to Watch Later'}
            >
              {inWatchLater ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setSelectedModalVideo(video)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="More details"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
