import React from 'react';
import { Film, Search, History, SlidersHorizontal, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MobileBottomNavProps {
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenAuth }) => {
  const { activeTab, setActiveTab, isAdmin } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 z-40 px-2 py-1.5 flex items-center justify-around text-[10px]">
      <button
        id="mobile-nav-home"
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
          activeTab === 'home' ? 'text-amber-400 font-bold' : 'text-zinc-400'
        }`}
      >
        <Film className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        id="mobile-nav-search"
        onClick={() => setActiveTab('search')}
        className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
          activeTab === 'search' ? 'text-amber-400 font-bold' : 'text-zinc-400'
        }`}
      >
        <Search className="w-5 h-5" />
        <span>Search</span>
      </button>

      <button
        id="mobile-nav-history"
        onClick={() => setActiveTab('history')}
        className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
          activeTab === 'history' ? 'text-amber-400 font-bold' : 'text-zinc-400'
        }`}
      >
        <History className="w-5 h-5" />
        <span>History</span>
      </button>

      {/* Admin Studio: ONLY shown if signed in with admin email */}
      {isAdmin && (
        <button
          id="mobile-nav-studio"
          onClick={() => setActiveTab('studio')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
            activeTab === 'studio' ? 'text-amber-400 font-bold' : 'text-amber-500/70'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Admin</span>
        </button>
      )}

      <button
        id="mobile-nav-account"
        onClick={onOpenAuth}
        className="flex flex-col items-center gap-1 p-1.5 text-zinc-400 hover:text-white"
      >
        <User className="w-5 h-5" />
        <span>Account</span>
      </button>
    </nav>
  );
};
