import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Plus, 
  Film, 
  Eye, 
  Heart, 
  Trash2, 
  Play, 
  Sparkles, 
  Flame, 
  RotateCcw, 
  CheckCircle2,
  ExternalLink,
  Tag,
  Layers,
  Filter,
  Tv,
  LogOut,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Video, VideoCategory } from '../types';
import { BulkUploadModal } from './BulkUploadModal';
import { EpisodeSeasonModal } from './EpisodeSeasonModal';

export const AdminStudio: React.FC = () => {
  const { 
    videos, 
    addVideo, 
    updateVideo, 
    deleteVideo, 
    playVideo, 
    seedResetVideos, 
    clearDemoVideos,
    clearAllVideos,
    showToast,
    user,
    isFirebaseConnected,
    logoutUser,
    setActiveTab
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<'All' | VideoCategory>('All');
  const [episodeManagingVideo, setEpisodeManagingVideo] = useState<Video | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [category, setCategory] = useState<VideoCategory>('Kdrama');
  const [quality, setQuality] = useState<'4K Ultra HD' | '1080p FHD' | '720p HD'>('4K Ultra HD');
  const [ageRating, setAgeRating] = useState<'All' | 'PG-13' | '16+' | 'TV-MA'>('16+');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [tagsInput, setTagsInput] = useState('Kdrama, Series, Drama');
  const [isVerse, setIsVerse] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOriginal, setIsOriginal] = useState(true);

  // Compute analytics
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0);

  const filteredAdminVideos = adminCategoryFilter === 'All' 
    ? videos 
    : videos.filter(v => v.category === adminCategoryFilter);

  const handleSubmitNewVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      showToast('Please provide at least a title and video streaming URL', 'warning');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    addVideo({
      title: title.trim(),
      tagline: tagline.trim() || title.trim(),
      description: description.trim() || 'A new release presented on ShowVerse Pro.',
      videoUrl: videoUrl.trim(),
      thumbnail: thumbnail.trim(),
      banner: thumbnail.trim(),
      category,
      quality,
      ageRating,
      tags,
      duration: durationMinutes * 60,
      formattedDuration: `${durationMinutes}m 00s`,
      releaseYear: new Date().getFullYear(),
      rating: 4.9,
      isTrending: true,
      isFeatured,
      isOriginal,
      isVerse,
      creatorName: user.name,
      creatorAvatar: user.avatar
    });

    // Reset and close
    setTitle('');
    setTagline('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              ShowVerse Creator & Admin Studio
            </h1>
            {isFirebaseConnected && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Firebase: show-verse-pro • Live
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Publish streams, manage catalog metadata, monitor viewership analytics, and curate features.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="purge-demo-btn"
            onClick={async () => {
              if (window.confirm('Remove all demo/AI sample videos and keep only genuine admin uploads?')) {
                await clearDemoVideos();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-zinc-800 text-xs font-semibold transition-colors"
            title="Remove all demo sample videos and keep only genuine admin uploads"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Purge AI/Demo Videos</span>
          </button>

          <button
            id="clear-all-btn"
            onClick={async () => {
              if (window.confirm('Are you sure you want to clear the entire catalog?')) {
                await clearAllVideos();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 text-xs font-semibold transition-colors"
            title="Clear all videos"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Catalog</span>
          </button>

          <button
            id="open-bulk-modal-btn"
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Bulk Video Upload</span>
          </button>

          <button
            id="open-publish-modal-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Real Video</span>
          </button>

          <button
            id="admin-logout-btn"
            onClick={async () => {
              await logoutUser();
              setActiveTab('home');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors"
            title="Log Out of Admin Account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">Catalog Media Items</p>
            <h3 className="text-2xl font-black text-white font-mono">{totalVideos} Titles</h3>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">Total Stream Plays</p>
            <h3 className="text-2xl font-black text-white font-mono">{totalViews.toLocaleString()}</h3>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">Community Upvotes</p>
            <h3 className="text-2xl font-black text-white font-mono">{totalLikes.toLocaleString()}</h3>
          </div>
        </div>

      </div>

      {/* Video Content Management Table */}
      <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Published Streams & Verses
            </h3>
            <p className="text-xs text-zinc-400">
              Directly edit visibility, filter by category, or launch bulk uploads.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={adminCategoryFilter}
                onChange={(e) => setAdminCategoryFilter(e.target.value as any)}
                className="bg-transparent text-zinc-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-zinc-900">All Categories ({videos.length})</option>
                <option value="Anime" className="bg-zinc-900">Anime ({videos.filter(v => v.category === 'Anime').length})</option>
                <option value="Kdrama" className="bg-zinc-900">Kdrama ({videos.filter(v => v.category === 'Kdrama').length})</option>
                <option value="Chinese Drama" className="bg-zinc-900">Chinese Drama ({videos.filter(v => v.category === 'Chinese Drama').length})</option>
                <option value="Movie" className="bg-zinc-900">Movie ({videos.filter(v => v.category === 'Movie').length})</option>
                <option value="Indian" className="bg-zinc-900">Indian ({videos.filter(v => v.category === 'Indian').length})</option>
              </select>
            </div>

            <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-1 rounded-xl">
              {filteredAdminVideos.length} Items
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Stream / Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Seasons & Episodes</th>
                <th className="py-3 px-3">Quality</th>
                <th className="py-3 px-3">Views</th>
                <th className="py-3 px-3">Likes</th>
                <th className="py-3 px-3">Curated Badges</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {filteredAdminVideos.map((vid) => (
                <tr key={vid.id} className="hover:bg-zinc-900/50 transition-colors">
                  
                  {/* Title & Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 aspect-video rounded overflow-hidden bg-black shrink-0">
                        <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate max-w-xs">{vid.title}</p>
                        <p className="text-[11px] text-zinc-400 truncate max-w-xs">{vid.creatorName}</p>
                      </div>
                    </div>
                  </td>

                  {/* Genre / Category Badge */}
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[11px] border ${
                      vid.category === 'Anime' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                      vid.category === 'Kdrama' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                      vid.category === 'Chinese Drama' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      vid.category === 'Movie' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' :
                      'bg-orange-500/20 text-orange-300 border-orange-500/30'
                    }`}>
                      {vid.category}
                    </span>
                  </td>

                  {/* Seasons & Episodes Manager Button */}
                  <td className="py-3 px-3">
                    <button
                      onClick={() => setEpisodeManagingVideo(vid)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-amber-500/50 transition-all font-mono text-[11px]"
                      title="Configure Seasons & Episodes for this title"
                    >
                      <Tv className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        {vid.episodes && vid.episodes.length > 0 
                          ? `${Array.from(new Set(vid.episodes.map(e => e.seasonNumber || 1))).length}S • ${vid.episodes.length} Ep`
                          : '+ Add Season'
                        }
                      </span>
                    </button>
                  </td>

                  {/* Quality */}
                  <td className="py-3 px-3 font-mono text-zinc-300">
                    {vid.quality}
                  </td>

                  {/* Views */}
                  <td className="py-3 px-3 font-mono">
                    {vid.views.toLocaleString()}
                  </td>

                  {/* Likes */}
                  <td className="py-3 px-3 font-mono text-rose-400">
                    {vid.likes.toLocaleString()}
                  </td>

                  {/* Badges Toggle */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateVideo(vid.id, { isFeatured: !vid.isFeatured })}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${
                          vid.isFeatured
                            ? 'bg-amber-500 text-zinc-950'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title="Toggle Featured on Hero Banner"
                      >
                        Featured
                      </button>

                      <button
                        onClick={() => updateVideo(vid.id, { isTrending: !vid.isTrending })}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${
                          vid.isTrending
                            ? 'bg-rose-500 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title="Toggle Trending"
                      >
                        Trending
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEpisodeManagingVideo(vid)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-indigo-400 transition-colors"
                        title="Manage Seasons & Episodes"
                      >
                        <Tv className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => playVideo(vid)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition-colors"
                        title="Play in Cinema Player"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => deleteVideo(vid.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Remove from Catalog"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish Video Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Publish Video or Verse Stream
                </h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitNewVideo} className="space-y-4 text-xs">
              
              {/* Title & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyber City: Overdrive"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Tagline</label>
                  <input
                    type="text"
                    placeholder="Short punchy tagline..."
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Real Video Stream URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400 font-semibold">Video Stream URL (MP4 / WebM / HLS) *</label>
                  <span className="text-[10px] text-zinc-500">Direct streaming video link</span>
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://.../video.mp4 or HLS .m3u8"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              {/* Real Thumbnail Image & Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400 font-semibold">Thumbnail Poster Image *</label>
                  <span className="text-[10px] text-zinc-500">Paste URL or pick image file</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="https://.../poster.jpg or choose file below"
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-amber-500 text-sm"
                    />
                    <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer border border-zinc-700 text-xs font-semibold shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pick File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (reader.result) {
                                setThumbnail(reader.result as string);
                                showToast('Image file selected for thumbnail', 'info');
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {thumbnail && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                      <img
                        src={thumbnail}
                        alt="Thumbnail preview"
                        className="w-20 aspect-video rounded-lg object-cover border border-zinc-750"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="flex-1 text-xs text-zinc-400 truncate">
                        <span className="text-zinc-300 font-semibold block">Poster Ready</span>
                        <span className="truncate block font-mono text-[10px]">{thumbnail.substring(0, 45)}...</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setThumbnail('')}
                        className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Category, Quality, Age Rating, Duration */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VideoCategory)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    {(['Kdrama', 'Chinese Drama', 'Anime', 'Movie', 'Indian'] as VideoCategory[]).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Resolution</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="4K Ultra HD">4K Ultra HD</option>
                    <option value="1080p FHD">1080p FHD</option>
                    <option value="720p HD">720p HD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Age Rating</label>
                  <select
                    value={ageRating}
                    onChange={(e) => setAgeRating(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="All">All</option>
                    <option value="PG-13">PG-13</option>
                    <option value="16+">16+</option>
                    <option value="TV-MA">TV-MA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    min="1"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Description & Tags */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Description / Plot Synopsis</label>
                <textarea
                  rows={3}
                  placeholder="Detailed synopsis of the title..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Cyberpunk, Action, Robots, VFX"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Checkbox Toggles */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVerse}
                    onChange={(e) => setIsVerse(e.target.checked)}
                    className="rounded border-zinc-800 accent-amber-500"
                  />
                  <span className="text-zinc-300">Format as "Verse" (Shorts feed)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-zinc-800 accent-amber-500"
                  />
                  <span className="text-zinc-300">Feature on Hero Spotlight</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOriginal}
                    onChange={(e) => setIsOriginal(e.target.checked)}
                    className="rounded border-zinc-800 accent-amber-500"
                  />
                  <span className="text-zinc-300">ShowVerse Pro Original Badge</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  Publish Stream
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal 
        isOpen={isBulkModalOpen} 
        onClose={() => setIsBulkModalOpen(false)} 
      />

      {/* Season & Episode Manager Modal */}
      <EpisodeSeasonModal
        video={episodeManagingVideo}
        isOpen={!!episodeManagingVideo}
        onClose={() => setEpisodeManagingVideo(null)}
      />

    </div>
  );
};
