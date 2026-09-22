import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Share2, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Pause,
  Flame,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Video } from '../types';

export const VersesFeed: React.FC = () => {
  const { 
    videos, 
    toggleWatchLater, 
    isInWatchLater, 
    isFavorite, 
    likeVideo, 
    showToast,
    comments,
    addComment
  } = useApp();

  // Filter for verses / shorts or short videos
  const verseVideos = videos.filter(v => v.isVerse || v.duration <= 90);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [newComment, setNewComment] = useState('');

  const currentVerse: Video | undefined = verseVideos[currentIndex];
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < verseVideos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // loop back
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(verseVideos.length - 1);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  if (!currentVerse) {
    return (
      <div className="py-20 text-center text-zinc-400">
        No verses currently available in catalog.
      </div>
    );
  }

  const inWatchLater = isInWatchLater(currentVerse.id);
  const isFav = isFavorite(currentVerse.id);
  const verseComments = comments.filter(c => c.videoId === currentVerse.id);

  return (
    <div className="max-w-md mx-auto px-4 py-4 sm:py-6 flex flex-col items-center">
      
      {/* Header Info */}
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h2 className="text-lg font-extrabold text-white tracking-tight font-['Outfit']">
          ShowVerse Feed
        </h2>
        <span className="text-xs text-zinc-500 font-mono">
          {currentIndex + 1} of {verseVideos.length}
        </span>
      </div>

      {/* Vertical Video Stage */}
      <div className="relative w-full aspect-[9/16] max-h-[720px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
        
        <video
          ref={videoRef}
          src={currentVerse.videoUrl}
          poster={currentVerse.thumbnail}
          loop
          muted={isMuted}
          playsInline
          autoPlay
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Center Pause Indicator */}
        {!isPlaying && (
          <div 
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center cursor-pointer pointer-events-none"
          >
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        )}

        {/* Sound toggle at top right */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/60 backdrop-blur-xs text-white hover:text-amber-400 transition-colors z-20"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Right Floating Actions Bar */}
        <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 z-20">
          
          {/* Like */}
          <button
            onClick={() => likeVideo(currentVerse.id)}
            className="flex flex-col items-center group"
          >
            <div className={`p-3 rounded-full backdrop-blur-md transition-all ${
              isFav ? 'bg-rose-600 text-white' : 'bg-black/60 text-white hover:bg-zinc-800'
            }`}>
              <Heart className={`w-5 h-5 ${isFav ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[11px] font-bold text-white mt-1 shadow drop-shadow">
              {currentVerse.likes}
            </span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setShowCommentsModal(true)}
            className="flex flex-col items-center group"
          >
            <div className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-zinc-800 transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-white mt-1 shadow drop-shadow">
              {verseComments.length}
            </span>
          </button>

          {/* Watch Later */}
          <button
            onClick={() => toggleWatchLater(currentVerse.id)}
            className="flex flex-col items-center group"
          >
            <div className={`p-3 rounded-full backdrop-blur-md transition-all ${
              inWatchLater ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-black/60 text-white hover:bg-zinc-800'
            }`}>
              {inWatchLater ? <Check className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-bold text-white mt-1 shadow drop-shadow">
              Save
            </span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/#verse/${currentVerse.id}`);
              showToast('Verse link copied!', 'success');
            }}
            className="flex flex-col items-center group"
          >
            <div className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-zinc-800 transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white mt-1 shadow drop-shadow">
              Share
            </span>
          </button>

        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
          <div className="pointer-events-auto space-y-1.5 max-w-[80%]">
            <div className="flex items-center gap-2">
              <img
                src={currentVerse.creatorAvatar}
                alt={currentVerse.creatorName}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-400"
              />
              <span className="text-xs font-bold text-white truncate drop-shadow">
                @{currentVerse.creatorName}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white drop-shadow line-clamp-2">
              {currentVerse.title}
            </h3>

            <p className="text-xs text-zinc-300 drop-shadow line-clamp-2 leading-tight">
              {currentVerse.description}
            </p>
          </div>
        </div>

      </div>

      {/* Desktop Navigation Arrows */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold text-white transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
          <span>Previous Verse</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-zinc-950 transition-colors shadow-md shadow-amber-500/20"
        >
          <span>Next Verse</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Comments Drawer */}
      {showCommentsModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 animate-in fade-in"
          onClick={() => setShowCommentsModal(false)}
        >
          <div 
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl max-h-[75vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h4 className="text-sm font-bold text-white font-['Outfit']">
                Comments ({verseComments.length})
              </h4>
              <button 
                onClick={() => setShowCommentsModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                Done
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {verseComments.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6">No comments yet. Say something cool!</p>
              ) : (
                verseComments.map((c) => (
                  <div key={c.id} className="flex gap-2.5 text-xs">
                    <img src={c.userAvatar} alt={c.userName} className="w-6 h-6 rounded-full shrink-0" />
                    <div>
                      <span className="font-bold text-white">{c.userName}</span>
                      <p className="text-zinc-300 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newComment.trim()) return;
                addComment(currentVerse.id, newComment);
                setNewComment('');
              }}
              className="flex gap-2 pt-2 border-t border-zinc-800"
            >
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-zinc-950 text-xs text-white px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-3 py-2 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Send
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
