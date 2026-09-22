import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { VideoCard } from './components/VideoCard';
import { PlayerView } from './components/PlayerView';
import { WatchLaterView } from './components/WatchLaterView';
import { HistoryView } from './components/HistoryView';
import { AdminStudio } from './components/AdminStudio';
import { SearchView } from './components/SearchView';
import { VideoModal } from './components/VideoModal';
import { ToastContainer } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { 
  RotateCcw, 
  Film, 
  Play, 
  Search,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Tv,
  Flame
} from 'lucide-react';
import { VideoCategory } from './types';
import { initNativeFeatures, triggerHaptic } from './lib/nativeBridge';

const MainAppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    videos, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    user,
    isAdmin,
    currentVideo,
    setCurrentVideo,
    selectedModalVideo,
    setSelectedModalVideo
  } = useApp();

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Setup Native Android Features (Status bar, back button, splash screen)
  React.useEffect(() => {
    initNativeFeatures({
      onBackButton: () => {
        if (isAuthOpen) {
          setIsAuthOpen(false);
          triggerHaptic('light');
          return true;
        }
        if (selectedModalVideo) {
          setSelectedModalVideo(null);
          triggerHaptic('light');
          return true;
        }
        if (currentVideo) {
          setCurrentVideo(null);
          triggerHaptic('light');
          return true;
        }
        if (activeTab !== 'home') {
          setActiveTab('home');
          triggerHaptic('light');
          return true;
        }
        return false;
      }
    });
  }, [isAuthOpen, selectedModalVideo, currentVideo, activeTab]);

  // Filter videos based on search or category
  const filteredVideos = videos.filter((v) => {
    const matchesSearch = searchQuery
      ? v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.tags && v.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
      : true;

    const matchesCategory = selectedCategory === 'All' ? true : v.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Highlight categories
  const featuredVideo = videos.find((v) => v.isFeatured) || videos[0];
  const kdramaVideos = videos.filter((v) => v.category === 'Kdrama');
  const chineseDramaVideos = videos.filter((v) => v.category === 'Chinese Drama');
  const animeVideos = videos.filter((v) => v.category === 'Anime');
  const movieVideos = videos.filter((v) => v.category === 'Movie');
  const indianVideos = videos.filter((v) => v.category === 'Indian');

  // Continue watching items from user history
  const continueWatchingItems = user.history
    .map(h => {
      const vid = videos.find(v => v.id === h.videoId);
      return vid ? { ...vid, historyData: h } : null;
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-black">
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      <main className="flex-1 pb-16 md:pb-0">
        {/* PLAYER TAB */}
        {activeTab === 'player' && <PlayerView />}

        {/* SEARCH TAB (Full page search experience) */}
        {activeTab === 'search' && <SearchView />}

        {/* WATCH LATER TAB */}
        {activeTab === 'watch-later' && <WatchLaterView />}

        {/* WATCH HISTORY TAB */}
        {activeTab === 'history' && <HistoryView />}

        {/* CREATOR & ADMIN STUDIO TAB (Strictly restricted to admin email) */}
        {activeTab === 'studio' && (
          isAdmin ? (
            <AdminStudio />
          ) : (
            <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">Access Restricted</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This section is restricted to authorized platform accounts. Please sign in to continue.
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                Sign In
              </button>
            </div>
          )
        )}

        {/* HOME / BROWSE TAB */}
        {activeTab === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* If searching or filtering by category (other than 'All') */}
            {searchQuery || selectedCategory !== 'All' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                      {searchQuery ? `Results for "${searchQuery}"` : `${selectedCategory} Collection`}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Showing {filteredVideos.length} matching streaming titles
                    </p>
                  </div>

                  {(searchQuery || selectedCategory !== 'All') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {filteredVideos.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <Search className="w-10 h-10 text-zinc-600 mx-auto" />
                    <p className="text-sm font-semibold text-zinc-400">No titles found</p>
                    <p className="text-xs text-zinc-500">Try selecting Kdrama, Chinese Drama, Anime, Movie, or Indian</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs mt-2"
                    >
                      Reset Search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredVideos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Standard Home View categorized cleanly */
              <div className="space-y-10">
                
                {/* Clean state when no videos are in catalog */}
                {videos.length === 0 && (
                  <div className="py-20 px-4 text-center max-w-lg mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-amber-400">
                      <Film className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-['Outfit']">Catalog Ready for Admin Videos</h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      AI and demo sample videos have been removed. Only real videos uploaded through the Admin Studio will appear here.
                    </p>
                    {isAdmin ? (
                      <button
                        onClick={() => setActiveTab('studio')}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
                      >
                        Open Admin Upload Studio
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsAuthOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-all"
                      >
                        Admin Login to Upload
                      </button>
                    )}
                  </div>
                )}

                {/* Hero Showcase Spotlight */}
                {featuredVideo && <HeroBanner featuredVideo={featuredVideo} />}

                {/* Continue Watching Section (if history exists) */}
                {continueWatchingItems.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-amber-500" />
                        <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                          Continue Watching
                        </h2>
                      </div>
                      <button
                        onClick={() => setActiveTab('history')}
                        className="text-xs font-semibold text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                      >
                        <span>View History</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {continueWatchingItems.slice(0, 4).map((item: any) => (
                        <VideoCard key={item.id} video={item} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Kdrama Section */}
                {kdramaVideos.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tv className="w-5 h-5 text-amber-400" />
                        <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                          Korean Drama (Kdrama)
                        </h2>
                      </div>
                      <button
                        onClick={() => setSelectedCategory('Kdrama')}
                        className="text-xs font-semibold text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                      >
                        <span>View All ({kdramaVideos.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {kdramaVideos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Chinese Drama Section */}
                {chineseDramaVideos.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-rose-400" />
                        <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                          Chinese Drama
                        </h2>
                      </div>
                      <button
                        onClick={() => setSelectedCategory('Chinese Drama')}
                        className="text-xs font-semibold text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                      >
                        <span>View All ({chineseDramaVideos.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {chineseDramaVideos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Anime Section */}
                {animeVideos.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                          Anime Series
                        </h2>
                      </div>
                      <button
                        onClick={() => setSelectedCategory('Anime')}
                        className="text-xs font-semibold text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                      >
                        <span>View All ({animeVideos.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {animeVideos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Movies Section */}
                {movieVideos.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Film className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                          Movies & Cinema
                        </h2>
                      </div>
                      <button
                        onClick={() => setSelectedCategory('Movie')}
                        className="text-xs font-semibold text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                      >
                        <span>View All ({movieVideos.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {movieVideos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Indian Section */}
                {indianVideos.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                        <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                          Indian Cinema & Series
                        </h2>
                      </div>
                      <button
                        onClick={() => setSelectedCategory('Indian')}
                        className="text-xs font-semibold text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                      >
                        <span>View All ({indianVideos.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {indianVideos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  </section>
                )}

              </div>
            )}

          </div>
        )}
      </main>

      {/* Detail Modal */}
      <VideoModal />

      {/* Auth Account Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Global Notifications */}
      <ToastContainer />

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-800/80 bg-zinc-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-400">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Play className="w-4 h-4 fill-zinc-950 text-zinc-950 ml-0.5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white font-['Outfit']">
                ShowVerse Pro
              </span>
              <p className="text-[11px] text-zinc-500">
                Premium Kdrama, Chinese Drama, Anime, Movies & Indian Series.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <button onClick={() => { setActiveTab('home'); setSelectedCategory('Kdrama'); }} className="hover:text-white">
              Kdrama
            </button>
            <button onClick={() => { setActiveTab('home'); setSelectedCategory('Chinese Drama'); }} className="hover:text-white">
              Chinese Drama
            </button>
            <button onClick={() => { setActiveTab('home'); setSelectedCategory('Anime'); }} className="hover:text-white">
              Anime
            </button>
            <button onClick={() => { setActiveTab('home'); setSelectedCategory('Movie'); }} className="hover:text-white">
              Movie
            </button>
            <button onClick={() => { setActiveTab('home'); setSelectedCategory('Indian'); }} className="hover:text-white">
              Indian
            </button>
            <button onClick={() => setActiveTab('watch-later')} className="hover:text-white">
              My List
            </button>
            {isAdmin && (
              <button onClick={() => setActiveTab('studio')} className="text-amber-400 hover:text-amber-300">
                Admin Studio
              </button>
            )}
          </div>

          <div className="text-zinc-500 text-right">
            <span>© {new Date().getFullYear()} ShowVerse. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
