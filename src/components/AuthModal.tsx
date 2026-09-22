import React, { useState } from 'react';
import { X, Lock, Mail, User, Check, LogIn, UserPlus } from 'lucide-react';
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
  const { user, updateUserProfile, updateUserRole, showToast } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup' | 'profile'>('signin');
  
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
      className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 pb-3 gap-4">
          <button
            onClick={() => setMode('signin')}
            className={`text-sm font-bold pb-1 transition-colors ${
              mode === 'signin' ? 'text-amber-400 border-b-2 border-amber-500' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`text-sm font-bold pb-1 transition-colors ${
              mode === 'signup' ? 'text-amber-400 border-b-2 border-amber-500' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => setMode('profile')}
            className={`text-sm font-bold pb-1 transition-colors ${
              mode === 'profile' ? 'text-amber-400 border-b-2 border-amber-500' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Account Details
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">
            {mode === 'signin' && 'Sign In to ShowVerse Pro'}
            {mode === 'signup' && 'Create Your ShowVerse Account'}
            {mode === 'profile' && 'Manage Your Streaming Profile'}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {mode === 'signin' && 'Access your personalized watchlist, comments, and cloud watch history.'}
            {mode === 'signup' && 'Join ShowVerse Pro for high-definition 4K streaming and creator tools.'}
            {mode === 'profile' && 'Update your display name and profile settings.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {(mode === 'signup' || mode === 'profile') && (
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-zinc-400 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {mode !== 'profile' && (
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {mode === 'signin' && <LogIn className="w-4 h-4" />}
            {mode === 'signup' && <UserPlus className="w-4 h-4" />}
            {mode === 'profile' && <Check className="w-4 h-4" />}
            <span>
              {isLoading ? 'Processing...' : (
                mode === 'signin' ? 'Sign In' :
                mode === 'signup' ? 'Create Account' :
                'Save Profile'
              )}
            </span>
          </button>
        </form>

        {mode !== 'profile' && (
          <div className="space-y-3 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-800 w-full" />
              <span className="bg-zinc-900 px-2 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                Or
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs border border-zinc-700 transition-all flex items-center justify-center gap-2"
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

        <div className="pt-2 border-t border-zinc-800 text-center">
          <button
            type="button"
            onClick={() => {
              showToast('Logged in as Guest Explorer', 'info');
              onClose();
            }}
            className="text-xs text-zinc-400 hover:text-zinc-300 underline font-medium"
          >
            Continue as Guest Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
