import React, { useState } from 'react';
import { X, Lock, Mail, User, Check, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useApp, isAuthorizedAdminEmail } from '../context/AppContext';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider 
} from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, updateUserRole, showToast, logoutUser } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup' | 'profile'>(user.email ? 'profile' : 'signin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user.name || '');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const fbUser = res.user;
      const isAdminUser = isAuthorizedAdminEmail(fbUser.email);
      updateUserProfile(fbUser.displayName || 'Google User', fbUser.photoURL || user.avatar);
      if (isAdminUser) {
        updateUserRole('admin');
        showToast('Admin access granted!', 'success');
      } else {
        updateUserRole('user');
        showToast(`Welcome, ${fbUser.displayName || 'Viewer'}!`, 'success');
      }
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Google sign in failed', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const targetEmail = email.trim().toLowerCase();
    const isAdminUser = isAuthorizedAdminEmail(targetEmail);

    try {
      if (password) {
        if (mode === 'signup') {
          const cred = await createUserWithEmailAndPassword(auth, targetEmail, password);
          if (name) await updateProfile(cred.user, { displayName: name });
        } else if (mode === 'signin') {
          await signInWithEmailAndPassword(auth, targetEmail, password);
        }
      }
    } catch (err: any) {
      console.warn("Firebase Auth operation:", err?.message || err);
      showToast(err?.message || 'Authentication error', 'warning');
    }

    // Local profile sync
    const finalName = name || targetEmail.split('@')[0] || 'Viewer';
    updateUserProfile(finalName, user.avatar);
    
    // Automatically elevate role if email matches authorized admin in background
    if (isAdminUser) {
      updateUserRole('admin');
      showToast('Admin access unlocked!', 'success');
    } else {
      updateUserRole('user');
      showToast(`Signed in as ${finalName}`, 'success');
    }

    setIsLoading(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-zinc-950 md:bg-black/85 md:backdrop-blur-sm flex flex-col md:items-center md:justify-center md:p-6 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full h-full md:h-auto md:max-h-[92vh] md:max-w-xl bg-zinc-950 md:bg-zinc-900 border-0 md:border md:border-zinc-800 md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full-Screen Header with Safe Area */}
        <div className="sticky top-0 z-20 bg-zinc-950/95 md:bg-zinc-900/95 backdrop-blur-md px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                ShowVerse Account
              </h2>
              <p className="text-xs text-zinc-400">
                {user.email ? user.email : 'Browsing as Guest Viewer'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 transition-colors"
            title="Close Account Screen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto flex-1 px-5 py-6 sm:p-7 space-y-6">
          
          {/* User Status Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 md:bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/30"
              />
              <div>
                <p className="text-sm font-bold text-white">{user.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    user.role === 'admin' 
                      ? 'bg-amber-500 text-zinc-950' 
                      : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'Standard Viewer'}
                  </span>
                  {user.email && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="hidden sm:flex items-center gap-3 text-center text-xs">
              <div className="px-2.5 py-1 rounded-lg bg-zinc-800/60 border border-zinc-750">
                <span className="block font-bold text-white">{user.favorites?.length || 0}</span>
                <span className="text-[10px] text-zinc-400">Favorites</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-zinc-800/60 border border-zinc-750">
                <span className="block font-bold text-white">{user.watchLater?.length || 0}</span>
                <span className="text-[10px] text-zinc-400">Watchlist</span>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-zinc-800 gap-6">
            <button
              onClick={() => setMode('signin')}
              className={`text-sm font-bold pb-2 transition-colors ${
                mode === 'signin' ? 'text-amber-400 border-b-2 border-amber-500' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`text-sm font-bold pb-2 transition-colors ${
                mode === 'signup' ? 'text-amber-400 border-b-2 border-amber-500' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setMode('profile')}
              className={`text-sm font-bold pb-2 transition-colors ${
                mode === 'profile' ? 'text-amber-400 border-b-2 border-amber-500' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Profile Settings
            </button>
          </div>

          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              {mode === 'signin' && 'Sign In to ShowVerse Pro'}
              {mode === 'signup' && 'Create Your ShowVerse Account'}
              {mode === 'profile' && 'Manage Your Streaming Profile'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {mode === 'signin' && 'Access your personalized watchlist, comments, and cloud watch history across devices.'}
              {mode === 'signup' && 'Join ShowVerse Pro for high-definition 4K streaming and creator tools.'}
              {mode === 'profile' && 'Update your display name and preferences.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {(mode === 'signup' || mode === 'profile') && (
              <div>
                <label className="block text-zinc-400 font-semibold mb-1.5">Display Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-zinc-400 font-semibold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            {mode !== 'profile' && (
              <div>
                <label className="block text-zinc-400 font-semibold mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {mode === 'signin' && <LogIn className="w-4 h-4" />}
              {mode === 'signup' && <UserPlus className="w-4 h-4" />}
              {mode === 'profile' && <Check className="w-4 h-4" />}
              <span>
                {isLoading ? 'Processing...' : (
                  mode === 'signin' ? 'Sign In to Account' :
                  mode === 'signup' ? 'Create Free Account' :
                  'Save Profile Details'
                )}
              </span>
            </button>
          </form>

          {mode !== 'profile' && (
            <div className="space-y-4 pt-1">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-zinc-800 w-full" />
                <span className="bg-zinc-950 md:bg-zinc-900 px-3 text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                  Or Sign In Instantly
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-semibold text-sm border border-zinc-800 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.8 0 12s.7 3.2 1.9 5.6l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16C3.7 19.8 7.5 23 12 23z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* Bottom Account Action Buttons */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                showToast('Continuing as Guest Viewer', 'info');
                onClose();
              }}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline font-medium"
            >
              Continue as Guest Viewer
            </button>

            {(user.email || user.role === 'admin') && (
              <button
                type="button"
                id="authmodal-logout-btn"
                onClick={async () => {
                  await logoutUser();
                  onClose();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of ShowVerse</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
