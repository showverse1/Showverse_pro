import React, { useState } from 'react';
import { 
  X, 
  Tv, 
  Plus, 
  Trash2, 
  Play, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Layers,
  Film
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Video, Episode } from '../types';

interface EpisodeSeasonModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_EPISODE_STREAMS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
];

const SAMPLE_THUMBNAILS = [
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80'
];

export const EpisodeSeasonModal: React.FC<EpisodeSeasonModalProps> = ({ video, isOpen, onClose }) => {
  const { updateVideo, showToast, playVideo } = useApp();

  const episodes = video?.episodes || [];

  // Available seasons
  const seasons = Array.from(new Set(episodes.map(ep => ep.seasonNumber || 1))).sort((a, b) => a - b);
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState<'All' | number>('All');

  // Form state to add new episode
  const [seasonNumber, setSeasonNumber] = useState<number>(seasons.length > 0 ? seasons[0] : 1);
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('24m 00s');
  const [videoUrl, setVideoUrl] = useState(SAMPLE_EPISODE_STREAMS[0]);
  const [thumbnail, setThumbnail] = useState(SAMPLE_THUMBNAILS[0]);
  const [description, setDescription] = useState('');

  if (!isOpen || !video) return null;

  // Filtered episodes
  const displayedEpisodes = selectedSeasonFilter === 'All'
    ? episodes
    : episodes.filter(ep => (ep.seasonNumber || 1) === selectedSeasonFilter);

  const handleAddEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter an episode title', 'warning');
      return;
    }

    const newEp: Episode = {
      id: `ep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      seasonNumber: Number(seasonNumber) || 1,
      episodeNumber: Number(episodeNumber) || 1,
      title: title.trim(),
      duration: duration.trim() || '24m 00s',
      videoUrl: videoUrl.trim() || SAMPLE_EPISODE_STREAMS[0],
      thumbnail: thumbnail.trim() || SAMPLE_THUMBNAILS[0],
      description: description.trim() || `Season ${seasonNumber} Episode ${episodeNumber} of ${video.title}.`
    };

    const updatedEpisodes = [...episodes, newEp].sort((a, b) => {
      if (a.seasonNumber !== b.seasonNumber) return a.seasonNumber - b.seasonNumber;
      return a.episodeNumber - b.episodeNumber;
    });

    updateVideo(video.id, { episodes: updatedEpisodes });
    showToast(`Added Season ${seasonNumber} Episode ${episodeNumber}: ${title}`, 'success');

    // Reset title and bump episodeNumber
    setTitle('');
    setDescription('');
    setEpisodeNumber(prev => prev + 1);
  };

  const handleDeleteEpisode = (episodeId: string) => {
    const updatedEpisodes = episodes.filter(ep => ep.id !== episodeId);
    updateVideo(video.id, { episodes: updatedEpisodes });
    showToast('Episode removed', 'info');
  };

  const handleCreateNewSeason = () => {
    const nextSeason = seasons.length > 0 ? Math.max(...seasons) + 1 : 1;
    setSeasonNumber(nextSeason);
    setEpisodeNumber(1);
    setTitle(`Episode 1`);
    setDescription(`Opening episode of Season ${nextSeason}.`);
    showToast(`Ready to add Season ${nextSeason} Episode 1! Fill details below and click Add.`, 'info');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-['Outfit']">
                  Season & Episode Manager
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-semibold">
                  {video.category}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Managing seasons and episodes for <strong className="text-white">{video.title}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seasons Toolbar */}
        <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs text-zinc-400 font-medium mr-1">Filter Season:</span>
            <button
              onClick={() => setSelectedSeasonFilter('All')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                selectedSeasonFilter === 'All'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              All Seasons ({episodes.length})
            </button>

            {seasons.map(s => {
              const count = episodes.filter(e => (e.seasonNumber || 1) === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSeasonFilter(s)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    selectedSeasonFilter === s
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  Season {s} ({count})
                </button>
              );
            })}
          </div>

          <button
            onClick={handleCreateNewSeason}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Season</span>
          </button>
        </div>

        {/* Content Body: Split view (Existing Episodes List & Add Form) */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Existing Episodes (Square Cards Row/Grid) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Existing Episodes ({displayedEpisodes.length})</span>
              </h3>
              <span className="text-[11px] text-zinc-400">
                Sorted by Season & Episode
              </span>
            </div>

            {displayedEpisodes.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-zinc-800 text-center">
                <Tv className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">No episodes configured for this season yet.</p>
                <p className="text-[11px] text-zinc-500 mt-1">Use the form on the right to add episodes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {displayedEpisodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="group relative aspect-square rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 overflow-hidden flex flex-col justify-between p-2.5 transition-all shadow-md"
                  >
                    {/* Square Thumbnail Image */}
                    <img
                      src={ep.thumbnail}
                      alt={ep.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />

                    {/* Top Row: Season Badge & Delete Button */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/90 text-zinc-950">
                        S{ep.seasonNumber || 1}:E{ep.episodeNumber}
                      </span>
                      <button
                        onClick={() => handleDeleteEpisode(ep.id)}
                        className="p-1 rounded bg-black/60 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Delete episode"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Bottom Info: Title & Duration */}
                    <div className="relative z-10 mt-auto">
                      <p className="text-xs font-bold text-white truncate drop-shadow">
                        {ep.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-300 font-mono mt-0.5">
                        <span>{ep.duration}</span>
                        <span className="text-zinc-400">Ready</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Add Episode Form */}
          <div className="lg:col-span-5 bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-800/80">
              <Plus className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Add Episode to Season
              </h3>
            </div>

            <form onSubmit={handleAddEpisode} className="space-y-3 text-xs">
              
              {/* Season Number & Episode Number */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                    Season Number *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={seasonNumber}
                    onChange={(e) => setSeasonNumber(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                    Episode Number *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                  Episode Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Episode 1: Arrival"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                  Duration (formatted)
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 24m 30s or 1h 02m"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Stream URL */}
              <div>
                <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                  Video Stream MP4 URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://.../video.mp4"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
                <div className="flex gap-1 mt-1">
                  {SAMPLE_EPISODE_STREAMS.slice(0, 3).map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setVideoUrl(url)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                    >
                      Sample #{i+1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                  Square Cover Thumbnail URL
                </label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                  Episode Synopsis (optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief synopsis..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Season {seasonNumber} Episode</span>
              </button>
            </form>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <p className="text-xs text-zinc-400">
            Episodes automatically appear in the Video Player grouped by their season tabs.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
