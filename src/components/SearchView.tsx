import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Filter, Film, Tv, Flame, Clapperboard, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VideoCard } from './VideoCard';
import { VideoCategory } from '../types';

const CATEGORIES: VideoCategory[] = ['All', 'Kdrama', 'Chinese Drama', 'Anime', 'Movie', 'Indian'];

const QUICK_TRENDING_SEARCHES = [
  'Solo Leveling',
  'Queen of Tears',
  'Demon Slayer',
  'Mirzapur',
  'Hidden Love',
  'Jujutsu Kaisen',
  'Panchayat',
  'Anime'
];

export const SearchView: React.FC = () => {
  const { 
    videos, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory 
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<VideoCategory>(selectedCategory || 'All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus search input when tab opens
    inputRef.current?.focus();
  }, []);

  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
  };

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  // Filter video list based on query & category
  const results = videos.filter((v) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q
      ? true
      : v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.creatorName.toLowerCase().includes(q) ||
        (v.tags && v.tags.some(t => t.toLowerCase().includes(q)));

    const matchesCategory = 
      activeCategoryFilter === 'All' 
        ? true 
        : v.category.toLowerCase() === activeCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Search Header Banner */}
      <div className="space-y-4 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-['Outfit'] tracking-tight">
          Explore & Search
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Find your favorite Kdrama, Chinese Drama, Anime, Blockbuster Movies, and Indian Cinema
        </p>

        {/* Primary Full Width Search Bar */}
        <div className="relative mt-2">
          <div className="relative flex items-center shadow-2xl rounded-2xl bg-zinc-900 border border-zinc-700/70 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/30 transition-all">
            <Search className="w-5 h-5 text-zinc-400 ml-4 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by title, genre, actor, or keyword..."
              className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-500 px-3.5 py-3.5 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="mr-3 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Trending Searches Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 mr-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            Trending:
          </span>
          {QUICK_TRENDING_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => handleTagClick(term)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-800 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategoryFilter(cat);
                setSelectedCategory(cat);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategoryFilter === cat
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-zinc-400 font-medium">
          Found <span className="text-amber-400 font-bold">{results.length}</span> titles
        </div>
      </div>

      {/* Search Results Display */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-['Outfit']">No matching titles found</h3>
            <p className="text-xs text-zinc-400">
              We couldn't find any results for "{searchQuery}". Try searching for popular Korean, Chinese, or Indian titles.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategoryFilter('All');
              setSelectedCategory('All');
            }}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            Clear Search & Filters
          </button>
        </div>
      )}

    </div>
  );
};
