import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  Check, 
  Heart, 
  Bookmark, 
  Share2, 
  Download, 
  Tv, 
  Subtitles, 
  Flame, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Copy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Episode, Video } from '../types';

export const PlayerView: React.FC = () => {
  const { 
    currentVideo, 
    currentEpisode, 
    setCurrentEpisode, 
    playVideo, 
    setActiveTab, 
    toggleWatchLater, 
    isInWatchLater, 
    isFavorite, 
    likeVideo, 
    updateWatchProgress, 
    getWatchProgress, 
    comments, 
    addComment, 
    toggleLikeComment, 
    addCommentReply, 
    user, 
    videos, 
    showToast 
  } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  // Player controls states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [isCaptionsOn, setIsCaptionsOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Comments state
  const [newCommentText, setNewCommentText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [commentSort, setCommentSort] = useState<'top' | 'newest'>('top');

  // Seasons state
  const availableSeasons = React.useMemo(() => {
    if (!currentVideo?.episodes || currentVideo.episodes.length === 0) return [];
    const seasonsSet = new Set<number>();
    currentVideo.episodes.forEach(e => seasonsSet.add(e.seasonNumber || 1));
    return Array.from(seasonsSet).sort((a, b) => a - b);
  }, [currentVideo?.episodes]);

  const [selectedSeason, setSelectedSeason] = useState<number>(() => {
    return currentEpisode?.seasonNumber || 1;
  });

  useEffect(() => {
    if (currentEpisode?.seasonNumber) {
      setSelectedSeason(currentEpisode.seasonNumber);
    } else if (availableSeasons.length > 0 && !availableSeasons.includes(selectedSeason)) {
      setSelectedSeason(availableSeasons[0]);
    }
  }, [currentEpisode, availableSeasons]);

  const seasonEpisodes = React.useMemo(() => {
    if (!currentVideo?.episodes) return [];
    return currentVideo.episodes.filter(e => (e.seasonNumber || 1) === selectedSeason);
  }, [currentVideo?.episodes, selectedSeason]);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!currentVideo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-zinc-400 mb-4">No video selected to play.</p>
        <button
          onClick={() => setActiveTab('home')}
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  // Determine active streaming video URL
  const activeVideoSource = currentEpisode?.videoUrl || currentVideo.videoUrl;

  // Restore progress on mount if previously watched
  useEffect(() => {
    const saved = getWatchProgress(currentVideo.id);
    if (saved && videoRef.current && saved.currentTime > 2) {
      videoRef.current.currentTime = saved.currentTime;
    }
  }, [currentVideo.id]);

  // Handle idle control hiding
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettingsMenu(false);
      }, 2800);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        skipTime(-10);
      } else if (e.code === 'ArrowRight') {
        skipTime(10);
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, isFullscreen]);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Skip 10s
  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds));
  };

  // Time update listener
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setCurrentTime(curr);
    setDuration(dur);

    // Save watch progress every few seconds
    if (Math.floor(curr) % 3 === 0) {
      updateWatchProgress(currentVideo.id, curr / dur, curr);
    }
  };

  // Seek bar handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  // Volume slider
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuteState = !isMuted;
    videoRef.current.muted = newMuteState;
    setIsMuted(newMuteState);
    if (!newMuteState && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  // Playback speed
  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettingsMenu(false);
    showToast(`Speed: ${rate}x`, 'info');
  };

  // Quality switcher
  const changeQuality = (q: string) => {
    setQuality(q);
    setShowSettingsMenu(false);
    showToast(`Quality set to ${q}`, 'info');
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      const remainingMins = mins % 60;
      return `${hrs}:${remainingMins < 10 ? '0' : ''}${remainingMins}:${remainder < 10 ? '0' : ''}${remainder}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  // Comments for this specific video
  const videoComments = comments.filter(c => c.videoId === currentVideo.id);
  const sortedComments = [...videoComments].sort((a, b) => {
    if (commentSort === 'top') return b.likes - a.likes;
    return b.id.localeCompare(a.id);
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(currentVideo.id, newCommentText);
    setNewCommentText('');
  };

  const handlePostReply = (commentId: string) => {
    if (!replyText.trim()) return;
    addCommentReply(commentId, replyText);
    setReplyText('');
    setActiveReplyId(null);
  };

  // Related recommended videos
  const relatedVideos = videos
    .filter(v => v.id !== currentVideo.id)
    .slice(0, 6);

  const inWatchLater = isInWatchLater(currentVideo.id);
  const isFav = isFavorite(currentVideo.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="text-amber-400 font-bold">{currentVideo.category}</span>
          <span>•</span>
          <span>{currentVideo.releaseYear}</span>
          <span>•</span>
          <span className="font-mono text-emerald-400">{quality}</span>
        </div>
      </div>

      {/* Main Player & Theater Layout */}
      <div className={`grid gap-6 ${isTheaterMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        
        {/* Left / Center Video Column */}
        <div className={isTheaterMode ? 'col-span-1' : 'lg:col-span-2'}>
          
          {/* Cinema Player Container */}
          <div
            ref={playerContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 group select-none"
          >
            <video
              ref={videoRef}
              src={activeVideoSource}
              poster={currentEpisode?.thumbnail || currentVideo.banner || currentVideo.thumbnail}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                if (videoRef.current) setDuration(videoRef.current.duration);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
              playsInline
            />

            {/* Subtitles Overlay Simulation */}
            {isCaptionsOn && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs sm:text-sm font-medium px-4 py-1.5 rounded-md pointer-events-none text-center shadow-lg border border-zinc-700/50 max-w-[85%]">
                [Soundtrack: Orchestral theme swells with cybernetic resonance]
              </div>
            )}

            {/* Large Center Play Button when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-2xl shadow-amber-500/40 hover:scale-110 active:scale-95 transition-all duration-200 z-20"
                aria-label="Play video"
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-zinc-950 ml-1" />
              </button>
            )}

            {/* Controls Bar Overlay */}
            <div
              className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pb-3 pt-8 transition-opacity duration-300 z-30 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Scrub Progress Bar */}
              <div className="relative flex items-center mb-3 group/bar">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 group-hover/bar:h-2.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500 transition-all"
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-zinc-200">
                
                {/* Left Controls: Play/Pause, Rewind, Forward, Volume, Time */}
                <div className="flex items-center gap-2 sm:gap-3.5">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 hover:text-amber-400 transition-colors"
                    title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  <button
                    onClick={() => skipTime(-10)}
                    className="p-1.5 hover:text-amber-400 transition-colors hidden sm:block"
                    title="Rewind 10s (Left Arrow)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => skipTime(10)}
                    className="p-1.5 hover:text-amber-400 transition-colors hidden sm:block"
                    title="Skip 10s (Right Arrow)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-1.5 group/vol">
                    <button onClick={toggleMute} className="p-1 hover:text-amber-400 transition-colors">
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5 text-rose-400" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-14 sm:w-20 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs font-mono text-zinc-300 ml-1">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-zinc-500 mx-1">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Right Controls: Subtitles, Speed/Quality, Theater, Fullscreen */}
                <div className="flex items-center gap-2 sm:gap-3">
                  
                  {/* Captions Toggle */}
                  <button
                    onClick={() => {
                      setIsCaptionsOn(!isCaptionsOn);
                      showToast(isCaptionsOn ? 'Subtitles Off' : 'Subtitles On (English)', 'info');
                    }}
                    className={`p-1.5 rounded transition-colors ${
                      isCaptionsOn ? 'text-amber-400 bg-zinc-800' : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Closed Captions"
                  >
                    <Subtitles className="w-4 h-4" />
                  </button>

                  {/* Settings Menu Toggle (Speed & Quality) */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                      className={`p-1.5 rounded hover:text-amber-400 transition-colors ${
                        showSettingsMenu ? 'text-amber-400' : 'text-zinc-300'
                      }`}
                      title="Playback Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    {/* Settings Dropdown */}
                    {showSettingsMenu && (
                      <div 
                        className="absolute right-0 bottom-9 w-48 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2.5 z-40 text-xs space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div>
                          <p className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px] mb-1">
                            Playback Speed
                          </p>
                          <div className="grid grid-cols-3 gap-1">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                              <button
                                key={rate}
                                onClick={() => changePlaybackRate(rate)}
                                className={`px-1.5 py-1 rounded text-center font-mono ${
                                  playbackRate === rate
                                    ? 'bg-amber-500 text-zinc-950 font-bold'
                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                              >
                                {rate}x
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-2">
                          <p className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px] mb-1">
                            Resolution Quality
                          </p>
                          <div className="grid grid-cols-2 gap-1 font-mono">
                            {['Auto', '1080p', '720p', '480p'].map((q) => (
                              <button
                                key={q}
                                onClick={() => changeQuality(q)}
                                className={`px-2 py-1 rounded text-center ${
                                  quality === q
                                    ? 'bg-amber-500 text-zinc-950 font-bold'
                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Theater Mode */}
                  <button
                    onClick={() => setIsTheaterMode(!isTheaterMode)}
                    className="p-1.5 text-zinc-300 hover:text-amber-400 transition-colors hidden md:block"
                    title={isTheaterMode ? 'Standard Layout' : 'Theater Mode'}
                  >
                    <Tv className="w-4 h-4" />
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 text-zinc-300 hover:text-amber-400 transition-colors"
                    title="Fullscreen (F)"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>

                </div>

              </div>
            </div>

          </div>

          {/* Video Metadata Header & Toolbar */}
          <div className="mt-4 space-y-4">
            
            {/* Title & Stats */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {currentVideo.isOriginal && (
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500 text-zinc-950">
                    ShowVerse Original
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-semibold">
                  {currentVideo.category}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                  {currentVideo.quality}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {currentVideo.ageRating}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
                {currentEpisode ? `${currentVideo.title} - ${currentEpisode.title}` : currentVideo.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4 mt-2 text-xs text-zinc-400">
                <div className="flex items-center gap-3">
                  <span>{(currentVideo.views + 1).toLocaleString()} views</span>
                  <span>•</span>
                  <span>Released {currentVideo.releaseYear}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">★ {currentVideo.rating.toFixed(1)} Rating</span>
                </div>

                {/* Video Action Toolbar */}
                <div className="flex items-center gap-2">
                  <button
                    id="player-like-btn"
                    onClick={() => likeVideo(currentVideo.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isFav 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/40' 
                        : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400' : ''}`} />
                    <span>{currentVideo.likes.toLocaleString()}</span>
                  </button>

                  <button
                    id="player-watchlater-btn"
                    onClick={() => toggleWatchLater(currentVideo.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      inWatchLater
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                        : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${inWatchLater ? 'fill-amber-400' : ''}`} />
                    <span>{inWatchLater ? 'In Watch Later' : 'Watch Later'}</span>
                  </button>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:bg-zinc-800 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => showToast('Offline download queued to device storage', 'success')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:bg-zinc-800 transition-colors hidden sm:flex"
                    title="Download offline"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Creator Profile Banner */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center gap-3">
                <img
                  src={currentVideo.creatorAvatar}
                  alt={currentVideo.creatorName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-500/30"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{currentVideo.creatorName}</h4>
                  <p className="text-xs text-zinc-400">Verified ShowVerse Creator</p>
                </div>
              </div>
            </div>

            {/* Description & Tags */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-sm space-y-2.5">
              <p className="text-zinc-300 leading-relaxed">
                {currentEpisode?.description || currentVideo.description}
              </p>

              {currentVideo.tags && currentVideo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentVideo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Episodic & Seasons selector (if this is a series) */}
            {currentVideo.episodes && currentVideo.episodes.length > 0 && (
              <div className="mt-8 border-t border-zinc-800/80 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-bold text-white font-['Outfit']">
                      Seasons & Episodes
                    </h3>
                    <span className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full font-mono">
                      {currentVideo.episodes.length} Total
                    </span>
                  </div>

                  {/* Season Selector Tabs */}
                  {availableSeasons.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {availableSeasons.map((sNum) => {
                        const count = currentVideo.episodes?.filter(e => (e.seasonNumber || 1) === sNum).length || 0;
                        const isSelected = selectedSeason === sNum;
                        return (
                          <button
                            key={sNum}
                            onClick={() => {
                              setSelectedSeason(sNum);
                              const firstOfSeason = currentVideo.episodes?.find(e => (e.seasonNumber || 1) === sNum);
                              if (firstOfSeason && currentEpisode?.seasonNumber !== sNum) {
                                setCurrentEpisode(firstOfSeason);
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                              isSelected
                                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                            }`}
                          >
                            <span>Season {sNum}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                              isSelected ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Episodes in Square Cards Row-Wise */}
                <div className="relative">
                  <div className="flex gap-3 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700">
                    {seasonEpisodes.map((ep) => {
                      const isCurrent = currentEpisode?.id === ep.id;
                      return (
                        <div
                          key={ep.id}
                          onClick={() => setCurrentEpisode(ep)}
                          className={`group relative flex-none w-36 sm:w-44 aspect-square rounded-2xl overflow-hidden cursor-pointer border transition-all duration-200 select-none ${
                            isCurrent
                              ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20 scale-[1.02]'
                              : 'border-zinc-800/80 bg-zinc-900/90 hover:border-zinc-600 hover:scale-[1.02]'
                          }`}
                        >
                          {/* Square Thumbnail Image */}
                          <img 
                            src={ep.thumbnail} 
                            alt={ep.title} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

                          {/* Top Row: Season/Episode Badge and Duration */}
                          <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md font-mono ${
                              isCurrent 
                                ? 'bg-amber-500 text-zinc-950 font-black' 
                                : 'bg-black/75 text-zinc-200 border border-zinc-700/60'
                            }`}>
                              S{ep.seasonNumber || 1}:E{ep.episodeNumber}
                            </span>

                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-zinc-300">
                              {ep.duration}
                            </span>
                          </div>

                          {/* Center Status / Hover Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {isCurrent ? (
                              <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-3 py-1 rounded-full border border-amber-500/50 shadow-md">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Playing</span>
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </div>
                            )}
                          </div>

                          {/* Bottom Content: Title and Brief Description */}
                          <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/95 to-transparent">
                            <p className="text-xs font-bold text-white truncate drop-shadow">
                              {ep.title}
                            </p>
                            <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                              {ep.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section (comments.js implementation) */}
            <div className="mt-8 border-t border-zinc-800 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-white font-['Outfit']">
                    Audience Discussion ({videoComments.length})
                  </h3>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
                  <button
                    onClick={() => setCommentSort('top')}
                    className={`px-2.5 py-1 rounded font-medium ${
                      commentSort === 'top' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400'
                    }`}
                  >
                    Top
                  </button>
                  <button
                    onClick={() => setCommentSort('newest')}
                    className={`px-2.5 py-1 rounded font-medium ${
                      commentSort === 'newest' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400'
                    }`}
                  >
                    Newest
                  </button>
                </div>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handlePostComment} className="flex gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-zinc-700"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Join the discussion... share your thoughts or favorite timestamp"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 bg-zinc-900 text-sm text-zinc-100 placeholder-zinc-500 px-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Post</span>
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4 pt-2">
                {sortedComments.length === 0 ? (
                  <p className="text-sm text-zinc-500 py-6 text-center">
                    No comments yet. Be the first to share your thoughts on this feature!
                  </p>
                ) : (
                  sortedComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 transition-colors space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={comment.userAvatar}
                            alt={comment.userName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <span className="text-xs font-bold text-white">{comment.userName}</span>
                            <span className="text-[11px] text-zinc-500 ml-2">{comment.timestamp}</span>
                          </div>
                        </div>

                        {/* Comment Like button */}
                        <button
                          onClick={() => toggleLikeComment(comment.id)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                            comment.isLiked
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-amber-400' : ''}`} />
                          <span>{comment.likes}</span>
                        </button>
                      </div>

                      <p className="text-xs text-zinc-300 pl-9 leading-relaxed">
                        {comment.text}
                      </p>

                      {/* Reply button & toggle */}
                      <div className="pl-9 flex items-center gap-3 text-xs">
                        <button
                          onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                          className="text-zinc-400 hover:text-amber-400 font-medium"
                        >
                          Reply
                        </button>
                      </div>

                      {/* Inline Reply Input */}
                      {activeReplyId === comment.id && (
                        <div className="pl-9 pt-2 flex gap-2">
                          <input
                            type="text"
                            placeholder={`Reply to ${comment.userName}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 bg-zinc-950 text-xs text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-amber-500"
                          />
                          <button
                            onClick={() => handlePostReply(comment.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs"
                          >
                            Reply
                          </button>
                        </div>
                      )}

                      {/* Nested Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="pl-9 pt-2 space-y-2 border-l-2 border-zinc-800 ml-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="pl-3 space-y-1">
                              <div className="flex items-center gap-2">
                                <img src={reply.userAvatar} alt={reply.userName} className="w-5 h-5 rounded-full" />
                                <span className="text-[11px] font-bold text-zinc-200">{reply.userName}</span>
                                <span className="text-[10px] text-zinc-500">{reply.timestamp}</span>
                              </div>
                              <p className="text-xs text-zinc-400 pl-7">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right Recommended Column */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center justify-between">
            <span>Next Up & Recommended</span>
            <span className="text-xs text-zinc-400 font-normal">Continuous Play</span>
          </h3>

          <div className="space-y-3">
            {relatedVideos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => playVideo(vid)}
                className="flex gap-3 p-2 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all group"
              >
                <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-zinc-950 shrink-0">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </div>
                  <span className="absolute bottom-1 right-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/80 text-zinc-200">
                    {vid.formattedDuration}
                  </span>
                </div>

                <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight">
                      {vid.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate mt-1">{vid.creatorName}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                    <span>{vid.category}</span>
                    <span>•</span>
                    <span>★ {vid.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upgrade / Pro Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/30 text-center space-y-2">
            <Sparkles className="w-6 h-6 text-amber-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">ShowVerse Pro Tier</h4>
            <p className="text-xs text-zinc-400">
              Enjoy zero buffering, full 4K HDR streams, spatial Dolby audio, and unlimited cloud downloads.
            </p>
          </div>
        </div>

      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white font-['Outfit']">Share Feature</h3>
            <p className="text-xs text-zinc-400">
              Copy the streaming link to share with friends or embed on external blogs.
            </p>

            <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800 text-xs">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/#watch/${currentVideo.id}`}
                className="flex-1 bg-transparent text-zinc-300 font-mono outline-none px-2"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/#watch/${currentVideo.id}`);
                  showToast('Direct stream link copied to clipboard!', 'success');
                  setIsShareModalOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
