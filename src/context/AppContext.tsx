import React, { createContext, useContext, useState, useEffect } from 'react';
import { Video, Episode, Comment, UserProfile, ActiveTab, VideoCategory, ToastMessage, UserHistoryItem } from '../types';
import { INITIAL_VIDEOS, INITIAL_COMMENTS } from '../data/initialVideos';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';

interface AppContextType {
  videos: Video[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentVideo: Video | null;
  setCurrentVideo: (video: Video | null) => void;
  currentEpisode: Episode | null;
  setCurrentEpisode: (episode: Episode | null) => void;
  playVideo: (video: Video, episode?: Episode) => void;
  user: UserProfile;
  updateUserRole: (role: 'user' | 'creator' | 'admin') => void;
  updateUserProfile: (name: string, avatar: string) => void;
  toggleWatchLater: (videoId: string) => void;
  toggleFavorite: (videoId: string) => void;
  isInWatchLater: (videoId: string) => boolean;
  isFavorite: (videoId: string) => boolean;
  updateWatchProgress: (videoId: string, progress: number, currentTime: number) => void;
  getWatchProgress: (videoId: string) => UserHistoryItem | undefined;
  clearHistory: () => void;
  removeFromWatchLater: (videoId: string) => void;
  comments: Comment[];
  addComment: (videoId: string, text: string) => void;
  toggleLikeComment: (commentId: string) => void;
  addCommentReply: (commentId: string, text: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: VideoCategory;
  setSelectedCategory: (cat: VideoCategory) => void;
  toasts: ToastMessage[];
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  addVideo: (newVid: Omit<Video, 'id' | 'createdAt' | 'views' | 'likes'>) => void;
  addBulkVideos: (newVideos: Omit<Video, 'id' | 'createdAt' | 'views' | 'likes'>[]) => void;
  updateVideo: (id: string, updated: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  seedResetVideos: () => void;
  selectedModalVideo: Video | null;
  setSelectedModalVideo: (video: Video | null) => void;
  likeVideo: (videoId: string) => void;
  isAdmin: boolean;
  isFirebaseConnected: boolean;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

export const ADMIN_EMAILS = [
  'verseshow94@gmail.com',
  'vimleshkumar901559@gmail.com',
  'admin@example.com'
];

export const isAuthorizedAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase().trim());
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VIDEOS: 'showverse_pro_videos_v1',
  COMMENTS: 'showverse_pro_comments_v1',
  USER: 'showverse_pro_user_v1'
};

const DEFAULT_USER: UserProfile = {
  id: 'guest-' + Math.random().toString(36).substring(2, 7),
  name: 'Viewer',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  role: 'user', // Default is strictly user/guest - hidden admin
  watchLater: [],
  favorites: [],
  history: []
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load videos
  const [videos, setVideos] = useState<Video[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_VIDEOS;
  });

  // Load comments
  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_COMMENTS;
  });

  // Load user (ensure role is validated against admin emails)
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email && isAuthorizedAdminEmail(parsed.email)) {
          return { ...parsed, role: 'admin' };
        }
        return { ...parsed, role: 'user' };
      }
    } catch {
      // fallback
    }
    return DEFAULT_USER;
  });

  // Listen to Firebase Auth state for automatic admin elevation
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    try {
      unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser && fbUser.email) {
          const admin = isAuthorizedAdminEmail(fbUser.email);
          setUser(prev => ({
            ...prev,
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            email: fbUser.email || '',
            avatar: fbUser.photoURL || prev.avatar,
            role: admin ? 'admin' : 'user'
          }));
        } else {
          setUser(prev => {
            if (prev.email && !isAuthorizedAdminEmail(prev.email)) {
              return { ...prev, email: '', role: 'user' };
            }
            return prev;
          });
        }
      });
    } catch (err) {
      console.warn("Firebase Auth listener error:", err);
    }

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  // Sync Videos with Firestore in real-time
  useEffect(() => {
    let isSubscribed = true;
    try {
      const videosCol = collection(db, 'videos');
      const unsubscribeVideos = onSnapshot(videosCol, async (snapshot) => {
        if (!isSubscribed) return;
        setIsFirebaseConnected(true);
        if (snapshot.empty) {
          // Fresh Firestore: automatically populate initial videos
          try {
            const batch = writeBatch(db);
            INITIAL_VIDEOS.forEach((v) => {
              const ref = doc(db, 'videos', v.id);
              batch.set(ref, v);
            });
            await batch.commit();
          } catch (seedErr) {
            console.warn("Initial Firestore videos seeding failed:", seedErr);
          }
        } else {
          const remoteVideos: Video[] = [];
          snapshot.forEach((snap) => {
            remoteVideos.push(snap.data() as Video);
          });
          if (remoteVideos.length > 0) {
            setVideos(remoteVideos);
          }
        }
      }, (err) => {
        console.warn("Firestore videos sync warning:", err);
      });

      return () => {
        isSubscribed = false;
        unsubscribeVideos();
      };
    } catch (err) {
      console.warn("Firestore setup warning:", err);
    }
  }, []);

  // Sync Comments with Firestore in real-time
  useEffect(() => {
    let isSubscribed = true;
    try {
      const commentsCol = collection(db, 'comments');
      const unsubscribeComments = onSnapshot(commentsCol, async (snapshot) => {
        if (!isSubscribed) return;
        if (snapshot.empty) {
          try {
            const batch = writeBatch(db);
            INITIAL_COMMENTS.forEach((c) => {
              const ref = doc(db, 'comments', c.id);
              batch.set(ref, c);
            });
            await batch.commit();
          } catch (seedErr) {
            console.warn("Initial Firestore comments seeding failed:", seedErr);
          }
        } else {
          const remoteComments: Comment[] = [];
          snapshot.forEach((snap) => {
            remoteComments.push(snap.data() as Comment);
          });
          if (remoteComments.length > 0) {
            setComments(remoteComments);
          }
        }
      }, (err) => {
        console.warn("Firestore comments sync warning:", err);
      });

      return () => {
        isSubscribed = false;
        unsubscribeComments();
      };
    } catch (err) {
      console.warn("Firestore comments setup warning:", err);
    }
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const fbUser = res.user;
      const admin = isAuthorizedAdminEmail(fbUser.email);
      setUser(prev => ({
        ...prev,
        id: fbUser.uid,
        name: fbUser.displayName || 'Google User',
        email: fbUser.email || '',
        avatar: fbUser.photoURL || prev.avatar,
        role: admin ? 'admin' : 'user'
      }));
      showToast(`Welcome back, ${fbUser.displayName || 'User'}!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Google sign-in cancelled or failed', 'warning');
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      // ignore
    }
    setUser(DEFAULT_USER);
    localStorage.removeItem(STORAGE_KEYS.USER);
    showToast('Signed out successfully', 'info');
  };

  const isAdmin = isAuthorizedAdminEmail(user.email) || user.role === 'admin';

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('All');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedModalVideo, setSelectedModalVideo] = useState<Video | null>(null);

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  // Toast dispatch
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Play video action
  const playVideo = (video: Video, episode?: Episode) => {
    setCurrentVideo(video);
    setCurrentEpisode(episode || (video.episodes && video.episodes.length > 0 ? video.episodes[0] : null));
    setActiveTab('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Watch Later and favorites toggles
  const toggleWatchLater = (videoId: string) => {
    setUser(prev => {
      const exists = prev.watchLater.includes(videoId);
      const updated = exists 
        ? prev.watchLater.filter(id => id !== videoId)
        : [...prev.watchLater, videoId];
      
      showToast(exists ? 'Removed from Watch Later' : 'Added to Watch Later', 'success');
      return { ...prev, watchLater: updated };
    });
  };

  const removeFromWatchLater = (videoId: string) => {
    setUser(prev => ({
      ...prev,
      watchLater: prev.watchLater.filter(id => id !== videoId)
    }));
    showToast('Removed from list', 'info');
  };

  const toggleFavorite = (videoId: string) => {
    setUser(prev => {
      const exists = prev.favorites.includes(videoId);
      const updated = exists
        ? prev.favorites.filter(id => id !== videoId)
        : [...prev.favorites, videoId];
      
      showToast(exists ? 'Removed from Favorites' : 'Saved to Favorites', 'success');
      return { ...prev, favorites: updated };
    });
  };

  const isInWatchLater = (videoId: string) => user.watchLater.includes(videoId);
  const isFavorite = (videoId: string) => user.favorites.includes(videoId);

  // Watch History & Resume
  const updateWatchProgress = (videoId: string, progress: number, currentTime: number) => {
    setUser(prev => {
      const filtered = prev.history.filter(h => h.videoId !== videoId);
      const newHistoryItem: UserHistoryItem = {
        videoId,
        progress: Math.min(1, Math.max(0, progress)),
        currentTime,
        updatedAt: new Date().toISOString()
      };
      return {
        ...prev,
        history: [newHistoryItem, ...filtered].slice(0, 30) // keep 30 latest
      };
    });
  };

  const getWatchProgress = (videoId: string) => {
    return user.history.find(h => h.videoId === videoId);
  };

  const clearHistory = () => {
    setUser(prev => ({ ...prev, history: [] }));
    showToast('Watch history cleared', 'info');
  };

  // User Profile
  const updateUserRole = (role: 'user' | 'creator' | 'admin') => {
    setUser(prev => ({ ...prev, role }));
    showToast(`Role switched to ${role.toUpperCase()}`, 'info');
  };

  const updateUserProfile = (name: string, avatar: string) => {
    setUser(prev => ({ ...prev, name, avatar }));
    showToast('Profile updated', 'success');
  };

  // Comments
  const addComment = async (videoId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: `cmt-${Date.now()}`,
      videoId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: text.trim(),
      timestamp: 'Just now',
      likes: 0,
      isLiked: false
    };
    setComments(prev => [newComment, ...prev]);
    showToast('Comment posted', 'success');

    try {
      await setDoc(doc(db, 'comments', newComment.id), newComment);
    } catch (err) {
      console.warn('Firestore add comment error:', err);
    }
  };

  const toggleLikeComment = async (commentId: string) => {
    let targetComment: Comment | undefined;
    setComments(prev =>
      prev.map(c => {
        if (c.id === commentId) {
          const isLiked = !c.isLiked;
          const updated = {
            ...c,
            isLiked,
            likes: isLiked ? c.likes + 1 : Math.max(0, c.likes - 1)
          };
          targetComment = updated;
          return updated;
        }
        return c;
      })
    );

    if (targetComment) {
      try {
        await updateDoc(doc(db, 'comments', commentId), {
          likes: targetComment.likes
        });
      } catch (err) {
        console.warn('Firestore like comment error:', err);
      }
    }
  };

  const addCommentReply = async (commentId: string, text: string) => {
    if (!text.trim()) return;
    let updatedReplies: any[] = [];
    setComments(prev =>
      prev.map(c => {
        if (c.id === commentId) {
          const replies = c.replies || [];
          const newReply = {
            id: `rep-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            text: text.trim(),
            timestamp: 'Just now',
            likes: 0
          };
          updatedReplies = [...replies, newReply];
          return {
            ...c,
            replies: updatedReplies
          };
        }
        return c;
      })
    );
    showToast('Reply added', 'success');

    try {
      await updateDoc(doc(db, 'comments', commentId), {
        replies: updatedReplies
      });
    } catch (err) {
      console.warn('Firestore add reply error:', err);
    }
  };

  // Video Actions
  const likeVideo = async (videoId: string) => {
    let targetLikes = 0;
    setVideos(prev =>
      prev.map(v => {
        if (v.id === videoId) {
          targetLikes = v.likes + 1;
          return { ...v, likes: targetLikes };
        }
        return v;
      })
    );
    toggleFavorite(videoId);

    try {
      await updateDoc(doc(db, 'videos', videoId), { likes: targetLikes });
    } catch (err) {
      console.warn('Firestore like video error:', err);
    }
  };

  const addVideo = async (newVidData: Omit<Video, 'id' | 'createdAt' | 'views' | 'likes'>) => {
    const id = `vid-custom-${Date.now()}`;
    const newVideo: Video = {
      ...newVidData,
      id,
      createdAt: new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0
    };
    setVideos(prev => [newVideo, ...prev]);
    showToast(`Published "${newVideo.title}"`, 'success');

    try {
      await setDoc(doc(db, 'videos', id), newVideo);
    } catch (err) {
      console.warn('Firestore video write error:', err);
    }
  };

  const addBulkVideos = async (newVideosData: Omit<Video, 'id' | 'createdAt' | 'views' | 'likes'>[]) => {
    if (!newVideosData.length) return;
    const timestamp = Date.now();
    const createdDate = new Date().toISOString().split('T')[0];
    const createdVideos: Video[] = newVideosData.map((data, index) => ({
      ...data,
      id: `vid-bulk-${timestamp}-${index}`,
      createdAt: createdDate,
      views: 0,
      likes: 0
    }));

    setVideos(prev => [...createdVideos, ...prev]);
    showToast(`Successfully bulk published ${createdVideos.length} videos into their respective categories!`, 'success');

    try {
      const batch = writeBatch(db);
      createdVideos.forEach((v) => {
        batch.set(doc(db, 'videos', v.id), v);
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore bulk write error:', err);
    }
  };

  const updateVideo = async (id: string, updated: Partial<Video>) => {
    setVideos(prev => prev.map(v => (v.id === id ? { ...v, ...updated } : v)));
    if (currentVideo?.id === id) {
      setCurrentVideo(prev => (prev ? { ...prev, ...updated } : null));
    }
    showToast('Video updated successfully', 'success');

    try {
      await updateDoc(doc(db, 'videos', id), updated);
    } catch (err) {
      console.warn('Firestore update video error:', err);
    }
  };

  const deleteVideo = async (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    if (currentVideo?.id === id) {
      setCurrentVideo(null);
      setActiveTab('home');
    }
    showToast('Video removed from catalog', 'info');

    try {
      await deleteDoc(doc(db, 'videos', id));
    } catch (err) {
      console.warn('Firestore delete video error:', err);
    }
  };

  const seedResetVideos = async () => {
    setVideos(INITIAL_VIDEOS);
    setComments(INITIAL_COMMENTS);
    localStorage.removeItem(STORAGE_KEYS.VIDEOS);
    localStorage.removeItem(STORAGE_KEYS.COMMENTS);

    try {
      const batch = writeBatch(db);
      INITIAL_VIDEOS.forEach((v) => {
        batch.set(doc(db, 'videos', v.id), v);
      });
      INITIAL_COMMENTS.forEach((c) => {
        batch.set(doc(db, 'comments', c.id), c);
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore reset error:', err);
    }

    showToast('Database reset to official ShowVerse library', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        videos,
        activeTab,
        setActiveTab,
        currentVideo,
        setCurrentVideo,
        currentEpisode,
        setCurrentEpisode,
        playVideo,
        user,
        updateUserRole,
        updateUserProfile,
        toggleWatchLater,
        toggleFavorite,
        isInWatchLater,
        isFavorite,
        updateWatchProgress,
        getWatchProgress,
        clearHistory,
        removeFromWatchLater,
        comments,
        addComment,
        toggleLikeComment,
        addCommentReply,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        toasts,
        showToast,
        removeToast,
        addVideo,
        addBulkVideos,
        updateVideo,
        deleteVideo,
        seedResetVideos,
        selectedModalVideo,
        setSelectedModalVideo,
        likeVideo,
        isAdmin,
        isFirebaseConnected,
        loginWithGoogle,
        logoutUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
