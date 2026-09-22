import React, { useState } from 'react';
import { 
  Play, 
  Search, 
  Bookmark, 
  History, 
  Film, 
  Sparkles, 
  ShieldCheck, 
  User, 
  X,
  Menu,
  SlidersHorizontal,
  Flame,
  Check,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VideoCategory } from '../types';

const CATEGORIES: VideoCategory[] = [
  'All',
  'Kdrama',
  'Chinese Drama',
  'Anime',
  'Movie',
  'Indian'
];

interface NavbarProps {
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    user,
    updateUserRole,
    isInWatchLater,
    videos,
    isAdmin,
    logoutUser
  } = useApp();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const watchLaterCount = user.watchLater.length;

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              id="brand-logo-btn"
              onClick={() => {
                setActiveTab('home');
                setSearchQuery('');
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
                <Play className="w-5 h-5 text-zinc-950 fill-zinc-950 ml-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-white font-['Outfit']">
                    ShowVerse
                  </span>
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 tracking-wider">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium hidden sm:block">
                  Cinema & Series Stream
                </p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                id="nav-home-btn"
                onClick={() => {
                  setActiveTab('home');
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'home'
                    ? 'text-white bg-zinc-800'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                Home
              </button>

              <button
                id="nav-search-btn"
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'search'
                    ? 'text-white bg-zinc-800'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>

              <button
                id="nav-history-btn"
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'text-white bg-zinc-800'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>

              {/* STRICT ADMIN ONLY BUTTON: Hidden by default, shown ONLY when signed in with admin email */}
              {isAdmin && (
                <button
                  id="nav-studio-btn"
                  onClick={() => setActiveTab('studio')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'studio'
                      ? 'text-zinc-950 bg-amber-400 font-extrabold shadow-md shadow-amber-500/30'
                      : 'text-amber-400 hover:text-white hover:bg-amber-500/10 border border-amber-500/30'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Admin Studio</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Actions (Profile & Mobile Toggle - Top search bar removed per user request) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* User Profile & Role Selector */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none"
                aria-label="User Profile Menu"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/40"
                />
                <span className="text-xs uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 hidden lg:inline-block border border-zinc-700">
                  {user.role}
                </span>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    {user.email && <p className="text-xs text-zinc-400 truncate">{user.email}</p>}
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Current Role:</span>
                      <span className="font-semibold text-amber-400 uppercase">{user.role}</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="px-2 py-2">
                      <p className="px-2 pb-1 text-[11px] font-medium text-amber-400 uppercase tracking-wider">
                        Administrator Access
                      </p>
                      <button
                        onClick={() => {
                          updateUserRole('admin');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 rounded-lg"
                      >
                        <span>Platform Admin</span>
                        {user.role === 'admin' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                      </button>
                    </div>
                  )}

                  <div className="border-t border-zinc-800 px-2 pt-2 space-y-1">
                    {onOpenAuth && (
                      <button
                        onClick={() => {
                          onOpenAuth();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg"
                      >
                        <User className="w-4 h-4 text-amber-400" />
                        Account & Authentication
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setActiveTab('studio');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-400 hover:bg-zinc-800 rounded-lg"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        Open Creator & Admin Studio
                      </button>
                    )}

                    <button
                      id="profile-logout-btn"
                      onClick={() => {
                        logoutUser();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border-t border-zinc-800/60 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Categories / Genre Filter Strip (shown on Home tab) */}
        {activeTab === 'home' && (
          <div className="py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-zinc-900">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-zinc-800 space-y-1">
            <button
              onClick={() => {
                setActiveTab('home');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                activeTab === 'home' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
              }`}
            >
              <Film className="w-4 h-4" /> Home
            </button>
            <button
              onClick={() => {
                setActiveTab('search');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                activeTab === 'search' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
              }`}
            >
              <Search className="w-4 h-4" /> Search
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                activeTab === 'history' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
              }`}
            >
              <History className="w-4 h-4" /> Watch History
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('studio');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-amber-400 ${
                  activeTab === 'studio' ? 'bg-zinc-800 font-semibold' : ''
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" /> Creator & Admin Studio
              </button>
            )}

            {onOpenAuth && (
              <button
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white"
              >
                <User className="w-4 h-4 text-amber-400" /> Account Settings
              </button>
            )}

            <button
              id="mobile-drawer-logout-btn"
              onClick={() => {
                logoutUser();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="w-4 h-4 text-rose-400" /> Log Out
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
