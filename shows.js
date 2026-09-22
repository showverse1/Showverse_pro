// shows.js - Show Verse Media Catalog & YouTube-Style Episode Parser
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js";

export const initialShows = [
  {
    id: "show_mirzapur",
    showKey: "mirzapur",
    title: "Mirzapur",
    category: "Indian",
    tag: "INDIAN",
    rating: "9.9",
    resolution: "4K HDR",
    audio: "Hindi Original Dolby 5.1 / English Subs",
    subtitles: "English CC, Hindi",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
    desc: "Akhandanand Tripathi made a fortune exporting carpets and became the mafia boss of Mirzapur. His throne is threatened by young aspirants in the violent badlands of Purvanchal.",
    year: "2024",
    status: "Ongoing",
    totalEpisodes: 10,
    episodes: [
      {
        episodeNumber: 1,
        season: 1,
        episodeTitle: "The Bhaukaal",
        duration: "52:10",
        thumbnail: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        synopsis: "Munna accidentally kills a groom at a wedding, setting into motion an epic clash of purvanchal powers."
      },
      {
        episodeNumber: 2,
        season: 1,
        episodeTitle: "Carpet & Guns",
        duration: "54:30",
        thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        synopsis: "Guddu and Bablu negotiate with Kaleen Bhaiya for control over illegal contraband distribution."
      }
    ]
  },
  {
    id: "show_queen_of_tears",
    showKey: "queen_of_tears",
    title: "Queen of Tears",
    category: "Kdrama",
    tag: "KDRAMA",
    rating: "9.8",
    resolution: "4K UHD",
    audio: "Korean Original / Hindi / English",
    subtitles: "English CC, Hindi, Korean, Indonesian",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    desc: "The queen of department stores and the prince of supermarkets weather a marital crisis—until love miraculously begins to bloom again amidst corporate intrigue.",
    year: "2024",
    status: "Completed",
    totalEpisodes: 16,
    episodes: [
      {
        episodeNumber: 1,
        season: 1,
        episodeTitle: "Episode 1",
        duration: "1:15:30",
        thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        synopsis: "Three years into a high-profile marriage, Baek Hyun-woo is overwhelmed by the chaebol family in-laws and considers filing for divorce—until Hae-in drops a bombshell."
      },
      {
        episodeNumber: 2,
        season: 1,
        episodeTitle: "Episode 2",
        duration: "1:18:20",
        thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        synopsis: "Hyun-woo starts acting unusually attentive towards Hae-in, catching everyone in Queens Group by surprise while a family rival returns from abroad."
      }
    ]
  },
  {
    id: "show_panchayat",
    showKey: "panchayat",
    title: "Panchayat",
    category: "Indian",
    tag: "INDIAN",
    rating: "9.9",
    resolution: "1080p FHD",
    audio: "Hindi Original",
    subtitles: "English CC, Hindi",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
    desc: "An engineering graduate takes up a job as an administrator in a remote rural village in Uttar Pradesh, encountering hilarious rural politics and heartfelt stories.",
    year: "2024",
    status: "Completed",
    totalEpisodes: 8,
    episodes: [
      {
        episodeNumber: 1,
        season: 1,
        episodeTitle: "Gram Panchayat Phulera",
        duration: "34:00",
        thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        synopsis: "Abhishek arrives in Phulera only to find the Panchayat office locked and the Pradhan-Pati presiding over local disputes."
      }
    ]
  },
  {
    id: "show_hidden_love",
    showKey: "hidden_love",
    title: "Hidden Love",
    category: "Chinese Drama",
    tag: "CHINESE DRAMA",
    rating: "9.7",
    resolution: "1080p FHD",
    audio: "Mandarin Original / English / Hindi",
    subtitles: "English CC, Hindi, Chinese Simplified",
    image: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?auto=format&fit=crop&w=1200&q=80",
    desc: "Sang Zhi falls in love with Duan Jia Xu, a boy who frequently visits her home to play games in her older brother's room. After years apart, they reunite as adults.",
    year: "2023",
    status: "Completed",
    totalEpisodes: 25,
    episodes: [
      {
        episodeNumber: 1,
        season: 1,
        episodeTitle: "Episode 1",
        duration: "45:10",
        thumbnail: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        synopsis: "Young Sang Zhi meets her brother's charming college roommate Duan Jiaxu, who steps in to help her out of a school predicament."
      }
    ]
  },
  {
    id: "show_spirited_away",
    showKey: "spirited_away",
    title: "Spirited Away",
    category: "Movie",
    tag: "MOVIE",
    rating: "9.9",
    resolution: "4K REMASTER",
    audio: "Japanese / English / Hindi Studio Master",
    subtitles: "English CC, Spanish, French, Japanese",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    desc: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, where humans are changed into beasts.",
    year: "2001",
    status: "Feature Film",
    totalEpisodes: 1,
    episodes: [
      {
        episodeNumber: 1,
        season: 1,
        episodeTitle: "Full Feature Film",
        duration: "2:05:00",
        thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        synopsis: "Chihiro navigates the mysterious bathhouse of the witch Yubaba to rescue her parents who were turned into pigs."
      }
    ]
  }
];

export let allShowsList = [...initialShows];
export let currentSelectedShow = null;
export let currentSelectedEpisodeIndex = 0;
let unsubscribeFirestoreShows = null;

/**
 * Normalizes title into standard showKey
 */
export function normalizeShowKey(rawTitle) {
  if (!rawTitle) return "untitled";
  return rawTitle.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
}

/**
 * Parses published flat Firestore episode docs and groups them into rich Show objects
 */
export function aggregateFirestoreEpisodesIntoShows(firestoreItems) {
  const showMap = new Map();

  // Seed with initial hardcoded shows
  initialShows.forEach(s => {
    const key = s.showKey || normalizeShowKey(s.title);
    showMap.set(key, {
      ...s,
      episodes: [...(s.episodes || [])]
    });
  });

  (firestoreItems || []).forEach(item => {
    const isMovie = item.category === "Movie";
    const rawSeries = item.seriesName || item.seriesTitle || item.title || "Untitled";
    const cleanSeriesTitle = isMovie ? (item.title || "Untitled Movie") : rawSeries.trim();
    const showKey = isMovie ? `movie_${item.docId || item.id}` : normalizeShowKey(cleanSeriesTitle);

    if (!showMap.has(showKey)) {
      showMap.set(showKey, {
        id: `show_${showKey}`,
        showKey: showKey,
        title: cleanSeriesTitle,
        category: item.category || "Anime",
        tag: (item.category || "Anime").toUpperCase(),
        rating: item.rating || "9.9",
        resolution: item.resolution || "4K MASTER",
        audio: item.audio || "Dolby Atmos 5.1 / Studio Master",
        subtitles: item.subtitles || "English CC, Spanish, Japanese, Hindi",
        image: item.image || "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
        desc: item.desc || `Watch ${cleanSeriesTitle} on Show Verse. High speed streaming in 4K UHD.`,
        year: item.year || new Date().getFullYear().toString(),
        status: isMovie ? "Feature Film" : "Ongoing",
        totalEpisodes: 1,
        episodes: []
      });
    }

    const targetShow = showMap.get(showKey);
    const epNum = isMovie ? 1 : (Number(item.episode) || (targetShow.episodes.length + 1));
    const seasonNum = isMovie ? 1 : (Number(item.season) || 1);

    const existingEpIdx = targetShow.episodes.findIndex(e => e.episodeNumber === epNum && e.season === seasonNum);
    const episodeObj = {
      id: item.docId || item.id || `ep_${epNum}`,
      episodeNumber: epNum,
      season: seasonNum,
      episodeTitle: isMovie ? "Full Feature Film" : (item.title && !item.title.startsWith("Episode") ? item.title : `Episode ${epNum}`),
      duration: item.duration || "24:00",
      thumbnail: item.image || targetShow.image,
      videoUrl: item.videoUrl || "",
      synopsis: item.desc || targetShow.desc
    };

    if (existingEpIdx !== -1) {
      targetShow.episodes[existingEpIdx] = episodeObj;
    } else {
      targetShow.episodes.push(episodeObj);
    }

    targetShow.totalEpisodes = targetShow.episodes.length;
  });

  // Sort episodes in each show
  showMap.forEach(show => {
    show.episodes.sort((a, b) => {
      if (a.season !== b.season) return a.season - b.season;
      return a.episodeNumber - b.episodeNumber;
    });
  });

  allShowsList = Array.from(showMap.values());
  window.allShowsList = allShowsList;
  return allShowsList;
}

/**
 * Initializes Firestore real-time listener for shows and episodes
 */
export function initShowsCatalog() {
  window.allShowsList = allShowsList;

  if (!db) {
    console.log("[ShowVerse Shows] Using built-in catalog (offline)");
    return;
  }

  if (unsubscribeFirestoreShows) {
    unsubscribeFirestoreShows();
  }

  try {
    const colRef = collection(db, "showverse_episodes");
    unsubscribeFirestoreShows = onSnapshot(colRef, (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({
          docId: docSnap.id,
          ...docSnap.data()
        });
      });

      aggregateFirestoreEpisodesIntoShows(items);

      if (typeof window.renderAllViews === "function") {
        window.renderAllViews();
      }
    }, (err) => {
      console.log("[ShowVerse Shows] Firestore snapshot offline fallback:", err?.message || "offline");
    });
  } catch (err) {
    console.warn("[ShowVerse Shows] Listener error:", err);
  }
}

/**
 * Opens YouTube Player page for a show and episode
 */
export function openShowPlayerPage(show, episodeIndex = 0, resumeTime = 0) {
  if (!show) return;

  currentSelectedShow = show;
  currentSelectedEpisodeIndex = episodeIndex;
  window.currentSelectedShow = show;
  window.currentSelectedEpisodeIndex = episodeIndex;

  const playerPage = document.getElementById("showPlayerPage");
  const mainAppContainer = document.getElementById("mainAppContainer");

  if (playerPage) {
    playerPage.classList.remove("hidden");
  }
  if (mainAppContainer) {
    mainAppContainer.classList.add("hidden");
  }

  window.scrollTo(0, 0);

  // Setup UI details
  updateYtPlayerDetails(show, episodeIndex);
  renderYtEpisodeQueue(show, episodeIndex);

  // Play video
  const ep = (show.episodes && show.episodes[episodeIndex]) ? show.episodes[episodeIndex] : null;
  const streamUrl = ep ? ep.videoUrl : (show.videoUrl || "");

  if (typeof window.loadVideoWithPlyr === "function") {
    window.loadVideoWithPlyr("main-video", streamUrl, resumeTime, {
      onEnded: () => {
        handleEpisodeFinished();
      }
    });
  }

  // Initialize comments
  if (typeof window.initEpisodeComments === "function") {
    window.initEpisodeComments(show, episodeIndex);
  }

  // Hide mobile bottom nav if open
  const bottomNav = document.getElementById("mobileBottomNav");
  if (bottomNav) bottomNav.classList.add("hidden");

  if (window.safeCreateIcons) {
    window.safeCreateIcons();
  } else if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Closes YouTube player page and returns to home
 */
export function closeShowPlayerPage() {
  const playerPage = document.getElementById("showPlayerPage");
  const mainAppContainer = document.getElementById("mainAppContainer");

  if (playerPage) {
    playerPage.classList.add("hidden");
  }
  if (mainAppContainer) {
    mainAppContainer.classList.remove("hidden");
  }

  if (typeof window.destroyCurrentPlayer === "function") {
    window.destroyCurrentPlayer();
  }

  const bottomNav = document.getElementById("mobileBottomNav");
  if (bottomNav) bottomNav.classList.remove("hidden");

  // Re-render continue watching if refreshed
  if (typeof window.renderContinueWatchingUI === "function") {
    window.renderContinueWatchingUI();
  }
}

/**
 * Switches to a specific episode within the YouTube player
 */
export function switchYtEpisode(index) {
  if (!currentSelectedShow || !currentSelectedShow.episodes) return;
  if (index < 0 || index >= currentSelectedShow.episodes.length) return;

  currentSelectedEpisodeIndex = index;
  window.currentSelectedEpisodeIndex = index;

  const ep = currentSelectedShow.episodes[index];
  updateYtPlayerDetails(currentSelectedShow, index);
  renderYtEpisodeQueue(currentSelectedShow, index);

  if (typeof window.loadVideoWithPlyr === "function") {
    window.loadVideoWithPlyr("main-video", ep.videoUrl, 0, {
      onEnded: () => {
        handleEpisodeFinished();
      }
    });
  }

  // Update comments active episode
  if (typeof window.updateActiveEpisodeInComments === "function") {
    window.updateActiveEpisodeInComments(ep.episodeNumber, ep.season);
  }
}

/**
 * Plays next episode in queue or loops
 */
export function playNextEpisode() {
  if (!currentSelectedShow || !currentSelectedShow.episodes) return;
  const nextIdx = currentSelectedEpisodeIndex + 1;
  if (nextIdx < currentSelectedShow.episodes.length) {
    switchYtEpisode(nextIdx);
  } else {
    if (window.showToast) window.showToast("You've reached the last episode of this series!");
  }
}

/**
 * Plays previous episode in queue
 */
export function playPrevEpisode() {
  if (!currentSelectedShow || !currentSelectedShow.episodes) return;
  const prevIdx = currentSelectedEpisodeIndex - 1;
  if (prevIdx >= 0) {
    switchYtEpisode(prevIdx);
  } else {
    if (window.showToast) window.showToast("This is the first episode!");
  }
}

/**
 * Handles end of episode: starts countdown or plays next if autoplay enabled
 */
export function handleEpisodeFinished() {
  if (!currentSelectedShow || !currentSelectedShow.episodes) return;
  const nextIdx = currentSelectedEpisodeIndex + 1;
  if (nextIdx >= currentSelectedShow.episodes.length) {
    if (window.showToast) window.showToast("Series completed! Thanks for watching.");
    return;
  }

  if (typeof window.isAutoplayEnabled === "function" && window.isAutoplayEnabled()) {
    triggerUpNextCountdown(nextIdx);
  }
}

let upNextTimer = null;
let upNextSeconds = 5;

export function triggerUpNextCountdown(nextIndex) {
  const overlay = document.getElementById("ytUpNextOverlay");
  const timerEl = document.getElementById("ytUpNextTimer");
  const nextTitleEl = document.getElementById("ytUpNextTitle");

  const nextEp = currentSelectedShow.episodes[nextIndex];
  if (!nextEp) return;

  if (nextTitleEl) {
    nextTitleEl.innerText = `${currentSelectedShow.title} - Ep ${nextEp.episodeNumber}`;
  }

  if (overlay) {
    overlay.classList.remove("hidden");
    overlay.style.display = "flex";
  }

  upNextSeconds = 5;
  if (timerEl) timerEl.innerText = `${upNextSeconds}s`;

  if (upNextTimer) clearInterval(upNextTimer);
  upNextTimer = setInterval(() => {
    upNextSeconds--;
    if (timerEl) timerEl.innerText = `${upNextSeconds}s`;

    if (upNextSeconds <= 0) {
      clearInterval(upNextTimer);
      upNextTimer = null;
      cancelUpNext();
      switchYtEpisode(nextIndex);
    }
  }, 1000);
}

export function cancelUpNext() {
  if (upNextTimer) {
    clearInterval(upNextTimer);
    upNextTimer = null;
  }
  const overlay = document.getElementById("ytUpNextOverlay");
  if (overlay) {
    overlay.classList.add("hidden");
    overlay.style.display = "none";
  }
}

/**
 * Updates UI labels and meta for the active show & episode
 */
export function updateYtPlayerDetails(show, episodeIndex) {
  const ep = (show.episodes && show.episodes[episodeIndex]) ? show.episodes[episodeIndex] : null;

  const titleEl = document.getElementById("ytVideoTitle");
  const seriesEl = document.getElementById("ytSeriesTitle");
  const catBadge = document.getElementById("ytCategoryBadge");
  const metaSeasonEp = document.getElementById("ytMetaSeasonEp");
  const descEl = document.getElementById("ytDescriptionText");
  const audioEl = document.getElementById("ytAudioBadge");
  const subEl = document.getElementById("ytSubBadge");
  const prevBtn = document.getElementById("ytPrevEpBtn");
  const nextBtn = document.getElementById("ytNextEpBtn");

  const epNum = ep ? ep.episodeNumber : 1;
  const seasonNum = ep ? (ep.season || 1) : 1;
  const epTitle = ep && ep.episodeTitle && !ep.episodeTitle.startsWith("Episode") ? `: ${ep.episodeTitle}` : "";

  if (titleEl) {
    titleEl.innerText = show.category === "Movie" ? show.title : `${show.title} - S${seasonNum} Ep ${epNum}${epTitle}`;
  }
  if (seriesEl) seriesEl.innerText = show.title;
  if (catBadge) {
    catBadge.innerText = show.category || "Anime";
  }
  if (metaSeasonEp) {
    metaSeasonEp.innerText = show.category === "Movie" ? "Feature Film" : `Season ${seasonNum} • Episode ${epNum}`;
  }
  if (descEl) {
    descEl.innerText = (ep && ep.synopsis) ? ep.synopsis : (show.desc || "");
  }
  if (audioEl) audioEl.innerText = show.audio || "Dolby 5.1";
  if (subEl) subEl.innerText = show.subtitles || "English CC";

  if (prevBtn) {
    prevBtn.disabled = episodeIndex <= 0;
    prevBtn.classList.toggle("opacity-40", episodeIndex <= 0);
  }
  if (nextBtn) {
    const isLast = !show.episodes || episodeIndex >= show.episodes.length - 1;
    nextBtn.disabled = isLast;
    nextBtn.classList.toggle("opacity-40", isLast);
  }

  // Update plyr top bar title
  const stageShow = document.getElementById("plyrStageShowTitle");
  const stageEp = document.getElementById("plyrStageEpTitle");
  if (stageShow) stageShow.textContent = show.title;
  if (stageEp) stageEp.textContent = `S${seasonNum} • Ep ${epNum}${epTitle}`;

  // Update watch later button icon
  if (typeof window.updateWatchLaterBtnState === "function") {
    window.updateWatchLaterBtnState(show.showKey);
  }
}

/**
 * Renders the right sidebar episode queue
 */
export function renderYtEpisodeQueue(show, activeIndex) {
  const container = document.getElementById("ytEpisodeQueueList");
  const counterEl = document.getElementById("ytQueueEpisodeCount");

  if (!container || !show.episodes) return;

  if (counterEl) {
    counterEl.innerText = `${show.episodes.length} Episodes`;
  }

  container.innerHTML = show.episodes.map((ep, idx) => {
    const isActive = idx === activeIndex;
    const epTitle = ep.episodeTitle || `Episode ${ep.episodeNumber}`;
    const duration = ep.duration || "24:00";
    const thumb = ep.thumbnail || show.image;

    return `
      <div 
        onclick="switchYtEpisode(${idx})" 
        class="flex items-center gap-3 p-2.5 rounded-2xl transition cursor-pointer group ${
          isActive 
            ? 'bg-brand-cyan/15 border border-brand-cyan/40 shadow-sm' 
            : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'
        }"
      >
        <!-- Thumbnail -->
        <div class="relative w-28 sm:w-32 aspect-video rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10">
          <img src="${thumb}" alt="${epTitle}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          <div class="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
          
          ${isActive ? `
            <div class="absolute inset-0 bg-brand-cyan/30 backdrop-blur-[1px] flex items-center justify-center">
              <i data-lucide="volume-2" class="w-5 h-5 text-black animate-pulse"></i>
            </div>
          ` : `
            <span class="absolute bottom-1 right-1 bg-black/80 text-[10px] font-mono font-bold text-slate-300 px-1.5 py-0.2 rounded">
              ${duration}
            </span>
          `}
        </div>

        <!-- Info -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-black ${isActive ? 'text-brand-cyan' : 'text-white'} truncate">
              Ep ${ep.episodeNumber}
            </span>
            ${isActive ? '<span class="px-1.5 py-0.2 bg-brand-cyan text-black text-[9px] font-black rounded-full uppercase">Playing</span>' : ''}
          </div>
          <p class="text-xs text-slate-300 truncate mt-0.5 group-hover:text-white">${epTitle}</p>
          <p class="text-[10px] text-slate-500 truncate mt-0.5">${ep.synopsis || show.title}</p>
        </div>
      </div>
    `;
  }).join("");

  if (window.safeCreateIcons) {
    window.safeCreateIcons(container);
  } else if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Global attachments
if (typeof window !== "undefined") {
  window.openShowPlayerPage = openShowPlayerPage;
  window.closeShowPlayerPage = closeShowPlayerPage;
  window.switchYtEpisode = switchYtEpisode;
  window.playNextEpisode = playNextEpisode;
  window.playPrevEpisode = playPrevEpisode;
  window.cancelUpNext = cancelUpNext;
  window.initShowsCatalog = initShowsCatalog;
  window.allShowsList = allShowsList;
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShowsCatalog);
  } else {
    initShowsCatalog();
  }
}
