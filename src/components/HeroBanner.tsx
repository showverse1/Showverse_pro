import React from 'react';
import { Play, Plus, Check, Info, Star, Shield, Film } from 'lucide-react';
import { Video } from '../types';
import { useApp } from '../context/AppContext';

interface HeroBannerProps {
  featuredVideo: Video;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ featuredVideo }) => {
  const { playVideo, toggleWatchLater, isInWatchLater, setSelectedModalVideo } = useApp();

  const inWatchLater = isInWatchLater(featuredVideo.id);

  return (
    <section className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] overflow-hidden rounded-2xl mb-8 group">
      {/* Background Poster / Backdrop */}
      <img
        src={featuredVideo.banner || featuredVideo.thumbnail}
        alt={featuredVideo.title}
        className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      {/* Multiple cinematic scrim gradients for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent" />

      {/* Content Container */}
      <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-8 flex flex-col justify-end pb-12 sm:pb-16">
        <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-0.5 rounded bg-amber-500 text-zinc-950 uppercase tracking-wide font-extrabold">
              Featured Premiere
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900/80 text-zinc-200 border border-zinc-700">
              {featuredVideo.category}
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900/80 text-emerald-400 border border-zinc-700 font-mono">
              {featuredVideo.quality}
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900/80 text-zinc-300 border border-zinc-700">
              {featuredVideo.ageRating}
            </span>
            <span className="text-zinc-400 font-mono">
              {featuredVideo.releaseYear} • {featuredVideo.formattedDuration}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-bold ml-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{featuredVideo.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-['Outfit'] drop-shadow-md">
            {featuredVideo.title}
          </h1>

          {/* Tagline / Synopsis */}
          <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 leading-relaxed max-w-xl font-normal drop-shadow">
            {featuredVideo.tagline || featuredVideo.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-play-btn"
              onClick={() => playVideo(featuredVideo)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
            >
              <Play className="w-5 h-5 fill-zinc-950" />
              Play Feature
            </button>

            <button
              id="hero-watchlater-btn"
              onClick={() => toggleWatchLater(featuredVideo.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border backdrop-blur-md transition-all duration-150 ${
                inWatchLater
                  ? 'bg-zinc-800 text-amber-400 border-amber-500/50'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-white border-zinc-700/80'
              }`}
            >
              {inWatchLater ? (
                <>
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>In My List</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to List</span>
                </>
              )}
            </button>

            <button
              id="hero-info-btn"
              onClick={() => setSelectedModalVideo(featuredVideo)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-200 hover:text-white font-semibold text-sm border border-zinc-700/60 backdrop-blur-md transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
