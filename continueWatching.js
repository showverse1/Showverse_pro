// continueWatching.js - Continue Watching & Resume Playback Engine
import { db, auth } from "./firebase.js";
import { getCurrentUser } from "./auth.js";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";

const STORAGE_KEY = 'showverse_continue_watching';
let continueWatchingList = [];
let firestoreUnsubscribe = null;

/**
 * Loads Continue Watching from LocalStorage
 */
export function getLocalContinueWatching() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

/**
 * Saves Continue Watching to LocalStorage
 */
export function setLocalContinueWatching(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
}

/**
 * Formats time in seconds to mm:ss or hh:mm:ss
 */
export function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Initializes Continue Watching module and Firestore cloud sync
 */
export function initContinueWatching() {
  continueWatchingList = getLocalContinueWatching();
  renderContinueWatchingUI();

  // Watch for auth changes to sync with Firestore
  if (auth) {
    auth.onAuthStateChanged((user) => {
      if (user && db) {
        syncWithFirestore(user.uid);
      } else {
        if (firestoreUnsubscribe) {
          try {
            firestoreUnsubscribe();
          } catch (_) {}
          firestoreUnsubscribe = null;
        }
        continueWatchingList = getLocalContinueWatching();
        renderContinueWatchingUI();
      }
    });
  }
}

/**
 * Syncs Continue Watching list with Firestore user document
 */
function syncWithFirestore(userId) {
  if (firestoreUnsubscribe) {
    try {
      firestoreUnsubscribe();
    } catch (_) {}
    firestoreUnsubscribe = null;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const subCol = collection(userDocRef, 'continueWatching');

    firestoreUnsubscribe = onSnapshot(subCol, (snapshot) => {
      const cloudItems = [];
      snapshot.forEach(docSnap => {
        cloudItems.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      // Merge local with cloud
      const mergedMap = new Map();
      continueWatchingList.forEach(item => mergedMap.set(item.showKey || item.title, item));
      cloudItems.forEach(item => mergedMap.set(item.showKey || item.title, item));

      continueWatchingList = Array.from(mergedMap.values());
      continueWatchingList.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

      setLocalContinueWatching(continueWatchingList);
      renderContinueWatchingUI();
    }, (err) => {
      console.log('[ContinueWatching] Offline sync fallback:', err?.message || 'offline');
    });
  } catch (err) {
    console.warn('[ContinueWatching] Sync setup error:', err);
  }
}

/**
 * Saves current playback progress for an episode
 */
export async function saveContinueWatchingProgress(currentTime, duration) {
  if (!currentTime || currentTime < 5) return; // Don't record trivial skips
  const curShow = window.currentSelectedShow;
  if (!curShow) return;

  const epIndex = typeof window.currentSelectedEpisodeIndex === 'number' ? window.currentSelectedEpisodeIndex : 0;
  const ep = (curShow.episodes && curShow.episodes[epIndex]) ? curShow.episodes[epIndex] : null;

  const showKey = curShow.showKey || (curShow.title || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  const percent = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;

  // If completed (>95%), remove from continue watching
  if (percent >= 95) {
    removeContinueWatchingItem(showKey);
    return;
  }

  const item = {
    id: showKey,
    showKey: showKey,
    title: curShow.title || 'Untitled',
    seriesTitle: curShow.title || 'Untitled',
    category: curShow.category || 'Anime',
    image: curShow.image || '',
    episodeIndex: epIndex,
    episodeNumber: ep ? (ep.episodeNumber || (epIndex + 1)) : (epIndex + 1),
    seasonNumber: ep ? (parseInt(ep.season, 10) || 1) : 1,
    episodeTitle: ep ? (ep.episodeTitle || `Episode ${epIndex + 1}`) : `Episode ${epIndex + 1}`,
    videoUrl: ep ? (ep.videoUrl || curShow.videoUrl || '') : (curShow.videoUrl || ''),
    currentTime: Math.floor(currentTime),
    duration: Math.floor(duration || 0),
    percent: percent,
    updatedAt: new Date().toISOString()
  };

  // Update in-memory and local storage
  const existingIdx = continueWatchingList.findIndex(x => x.showKey === showKey);
  if (existingIdx !== -1) {
    continueWatchingList[existingIdx] = item;
  } else {
    continueWatchingList.unshift(item);
  }

  continueWatchingList.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  // Cap at 20 items
  if (continueWatchingList.length > 20) {
    continueWatchingList = continueWatchingList.slice(0, 20);
  }

  setLocalContinueWatching(continueWatchingList);
  renderContinueWatchingUI();

  // Sync to Firestore if authenticated
  const user = getCurrentUser();
  if (user && db) {
    try {
      const itemDocRef = doc(db, 'users', user.uid, 'continueWatching', showKey);
      await setDoc(itemDocRef, item, { merge: true });
    } catch (err) {
      console.warn('[ContinueWatching] Cloud save notice:', err);
    }
  }
}

/**
 * Removes an item from continue watching
 */
export async function removeContinueWatchingItem(showKey, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  continueWatchingList = continueWatchingList.filter(x => x.showKey !== showKey);
  setLocalContinueWatching(continueWatchingList);
  renderContinueWatchingUI();

  if (window.showToast) {
    window.showToast("Removed from Continue Watching");
  }

  const user = getCurrentUser();
  if (user && db) {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'continueWatching', showKey));
    } catch (_) {}
  }
}

/**
 * Resumes playing the episode from continue watching
 */
export function resumePlayback(showKey) {
  const item = continueWatchingList.find(x => x.showKey === showKey);
  if (!item) return;

  if (typeof window.openShowPlayerPage === 'function' && window.allShowsList) {
    const fullShow = window.allShowsList.find(s => {
      const k = s.showKey || (s.title || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      return k === showKey;
    });

    if (fullShow) {
      window.openShowPlayerPage(fullShow, item.episodeIndex || 0, item.currentTime || 0);
      return;
    }
  }

  // Fallback direct playback
  if (typeof window.playMedia === 'function') {
    window.playMedia(item.title, item.videoUrl);
    setTimeout(() => {
      const vid = window.getActiveVideo ? window.getActiveVideo() : document.querySelector('video');
      if (vid && item.currentTime) {
        vid.currentTime = item.currentTime;
      }
    }, 500);
  }
}

/**
 * Renders the Continue Watching rail in the home view
 */
export function renderContinueWatchingUI() {
  const section = document.getElementById('continueWatchingSection');
  const container = document.getElementById('continueWatchingList');
  const countBadge = document.getElementById('continueWatchingCountBadge');

  if (!section || !container) return;

  if (continueWatchingList.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  if (countBadge) {
    countBadge.innerText = `${continueWatchingList.length}`;
  }

  container.innerHTML = continueWatchingList.map((item) => {
    const epLabel = `S${item.seasonNumber || 1} • Ep ${item.episodeNumber || 1}`;
    const timeLeftSec = Math.max(0, (item.duration || 0) - (item.currentTime || 0));
    const timeLeftStr = timeLeftSec > 0 ? `${Math.ceil(timeLeftSec / 60)}m left` : 'Resume';
    const progress = Math.max(5, Math.min(95, item.percent || 0));
    const safeTitle = (item.title || '').replace(/'/g, "\\'");
    const safeShowKey = item.showKey.replace(/'/g, "\\'");

    return `
      <div class="relative group/cw flex-shrink-0 w-64 sm:w-72 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-cyan/40 transition-all duration-300 overflow-hidden shadow-lg cursor-pointer" onclick="resumePlayback('${safeShowKey}')">
        <!-- Thumbnail Container -->
        <div class="relative w-full aspect-video bg-slate-900 overflow-hidden">
          <img src="${item.image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'}" alt="${item.title}" class="w-full h-full object-cover group-hover/cw:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

          <!-- Play button overlay -->
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cw:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
            <div class="w-12 h-12 rounded-full bg-brand-cyan text-black flex items-center justify-center shadow-neon-cyan transform scale-90 group-hover/cw:scale-100 transition-transform">
              <i data-lucide="play" class="w-5 h-5 fill-current ml-0.5"></i>
            </div>
          </div>

          <!-- Delete button -->
          <button 
            type="button" 
            onclick="removeContinueWatchingItem('${safeShowKey}', event)" 
            class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-rose-500 text-white/70 hover:text-white flex items-center justify-center opacity-0 group-hover/cw:opacity-100 transition-all cursor-pointer z-10" 
            title="Remove from Continue Watching"
          >
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>

          <!-- Episode badge -->
          <div class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-brand-cyan border border-white/10">
            ${epLabel}
          </div>

          <!-- Time remaining badge -->
          <div class="absolute bottom-3 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-slate-300">
            ${timeLeftStr}
          </div>

          <!-- Progress Bar at bottom of thumbnail -->
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div class="h-full bg-brand-cyan shadow-neon-cyan transition-all" style="width: ${progress}%"></div>
          </div>
        </div>

        <!-- Info -->
        <div class="p-3">
          <h4 class="font-bold text-sm text-white truncate group-hover/cw:text-brand-cyan transition-colors">${item.title}</h4>
          <p class="text-xs text-slate-400 truncate mt-0.5">${item.episodeTitle || epLabel}</p>
        </div>
      </div>
    `;
  }).join('');

  if (window.safeCreateIcons) {
    window.safeCreateIcons(container);
  } else if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Window attachments
if (typeof window !== "undefined") {
  window.saveContinueWatchingProgress = saveContinueWatchingProgress;
  window.removeContinueWatchingItem = removeContinueWatchingItem;
  window.resumePlayback = resumePlayback;
  window.initContinueWatching = initContinueWatching;
  window.renderContinueWatchingUI = renderContinueWatchingUI;
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', initContinueWatching);
  } else {
    initContinueWatching();
  }
}
