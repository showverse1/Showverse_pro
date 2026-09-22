// navigation.js - SPA View Routing, Category Filtering & Search for Show Verse
import { allShowsList, openShowPlayerPage } from "./shows.js";
import { publishedEpisodesCache } from "./admin.js";

export let currentActiveTab = 'home';
export let currentCategoryFilter = 'All';

/**
 * Switches the primary navigation tab: 'home', 'anime', 'kdrama', 'cdrama', 'movies', 'library', 'explore'
 */
export function switchNavTab(tabName) {
  currentActiveTab = tabName;

  // Sync category filter with tab
  if (tabName === 'indian') {
    currentCategoryFilter = 'Indian';
  } else if (tabName === 'anime') {
    currentCategoryFilter = 'Anime';
  } else if (tabName === 'kdrama') {
    currentCategoryFilter = 'Kdrama';
  } else if (tabName === 'cdrama') {
    currentCategoryFilter = 'Chinese Drama';
  } else if (tabName === 'movies') {
    currentCategoryFilter = 'Movie';
  } else {
    currentCategoryFilter = 'All';
  }

  // Update nav highlight styles
  updateNavUI(tabName);

  // Close player if open
  const ytPlayer = document.getElementById('showPlayerPage');
  if (ytPlayer && !ytPlayer.classList.contains('hidden')) {
    if (typeof window.closeShowPlayerPage === 'function') {
      window.closeShowPlayerPage();
    }
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Render view
  renderActiveView();
}

/**
 * Updates UI styling of navbar buttons and mobile bottom nav items
 */
export function updateNavUI(activeTab) {
  // Desktop Nav items
  const navTabs = ['home', 'anime', 'kdrama', 'cdrama', 'movies', 'library'];
  navTabs.forEach(t => {
    const el = document.getElementById(`nav-tab-${t}`);
    if (el) {
      if (t === activeTab) {
        el.className = 'px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer bg-brand-cyan text-black shadow-neon-cyan';
      } else {
        el.className = 'px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer text-slate-300 hover:text-white hover:bg-white/10';
      }
    }
  });

  // Mobile Bottom Nav items
  const mobileTabs = ['home', 'explore', 'anime', 'kdrama', 'library'];
  mobileTabs.forEach(t => {
    const el = document.getElementById(`mobile-nav-${t}`);
    if (el) {
      if (t === activeTab) {
        el.className = 'flex flex-col items-center gap-1 text-brand-cyan transition-colors select-none cursor-pointer';
      } else {
        el.className = 'flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors select-none cursor-pointer';
      }
    }
  });
}

/**
 * Filters and renders catalog into the main grid
 */
export function renderActiveView() {
  const container = document.getElementById('mainMediaGrid');
  const sectionTitle = document.getElementById('mainSectionTitle');
  const heroSection = document.getElementById('heroBannerSection');
  const cwSection = document.getElementById('continueWatchingSection');

  if (!container) return;

  const catalog = window.allShowsList || allShowsList || [];
  let filtered = [...catalog];

  if (currentCategoryFilter !== 'All') {
    filtered = filtered.filter(s => (s.category || '').toLowerCase() === currentCategoryFilter.toLowerCase());
  }

  // Hide/show hero on non-home pages
  if (heroSection) {
    if (currentActiveTab === 'home') {
      heroSection.classList.remove('hidden');
    } else {
      heroSection.classList.add('hidden');
    }
  }

  // Update section title
  if (sectionTitle) {
    if (currentActiveTab === 'home') {
      sectionTitle.innerText = "Trending & Featured Series";
    } else if (currentActiveTab === 'anime') {
      sectionTitle.innerText = "Anime Hub (Simulcasts & Dubs)";
    } else if (currentActiveTab === 'kdrama') {
      sectionTitle.innerText = "K-Drama Universe";
    } else if (currentActiveTab === 'cdrama') {
      sectionTitle.innerText = "Chinese Drama Collection";
    } else if (currentActiveTab === 'movies') {
      sectionTitle.innerText = "Blockbuster Movies & Features";
    } else if (currentActiveTab === 'library') {
      sectionTitle.innerText = "Your Library & Saved Shows";
    }
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-12 text-center text-xs text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
        <i data-lucide="film" class="w-8 h-8 text-slate-500"></i>
        <p class="font-bold text-sm text-slate-200">No shows found in this category</p>
        <p class="text-xs text-slate-400">Upload new titles or check back soon for fresh episodes!</p>
      </div>
    `;
    if (window.safeCreateIcons) window.safeCreateIcons(container);
    return;
  }

  container.innerHTML = filtered.map((show, idx) => {
    const safeKey = (show.showKey || show.title).replace(/'/g, "\\'");
    const totalEps = (show.episodes && show.episodes.length) || show.totalEpisodes || 1;
    const epBadge = show.category === 'Movie' ? 'Movie' : `${totalEps} Ep${totalEps > 1 ? 's' : ''}`;
    const categoryClass = show.category === 'Kdrama' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                          show.category === 'Anime' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                          show.category === 'Chinese Drama' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          'bg-purple-500/20 text-purple-300 border-purple-500/40';

    return `
      <div 
        class="group/card relative rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-cyan/50 transition-all duration-300 overflow-hidden shadow-lg flex flex-col cursor-pointer hover:-translate-y-1"
        onclick="playShowFromCatalog('${safeKey}')"
      >
        <!-- Poster Thumbnail -->
        <div class="relative w-full aspect-[16/10] sm:aspect-video bg-slate-900 overflow-hidden">
          <img 
            src="${show.image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'}" 
            alt="${show.title}" 
            class="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
            loading="lazy"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

          <!-- Play button hover overlay -->
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
            <div class="w-12 h-12 rounded-full bg-brand-cyan text-black flex items-center justify-center shadow-neon-cyan transform scale-90 group-hover/card:scale-100 transition-transform">
              <i data-lucide="play" class="w-5 h-5 fill-current ml-0.5"></i>
            </div>
          </div>

          <!-- Rating & Category tags -->
          <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider backdrop-blur-md ${categoryClass}">
              ${show.category || 'Anime'}
            </span>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/30 flex items-center gap-1">
              <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i> ${show.rating || '9.9'}
            </span>
          </div>

          <!-- Resolution & Episode count badge -->
          <div class="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 text-[10px] font-mono">
            <span class="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-brand-cyan font-bold border border-brand-cyan/30">
              ${epBadge}
            </span>
            <span class="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-slate-300">
              ${show.resolution || '4K'}
            </span>
          </div>
        </div>

        <!-- Meta -->
        <div class="p-3.5 flex flex-col flex-1 justify-between gap-2">
          <div>
            <h3 class="font-black text-sm sm:text-base text-white group-hover/card:text-brand-cyan transition-colors truncate">
              ${show.title}
            </h3>
            <p class="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              ${show.desc || ''}
            </p>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-500">
            <span class="truncate max-w-[140px]">${show.audio || 'Multi Audio'}</span>
            <button 
              type="button" 
              onclick="event.stopPropagation(); toggleWatchLater('${safeKey}')"
              class="hover:text-brand-cyan transition p-1 cursor-pointer"
              title="Add to Watch Later"
            >
              <i data-lucide="bookmark" class="w-4 h-4"></i>
            </button>
          </div>
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

/**
 * Click handler for show cards
 */
export function playShowFromCatalog(showKey) {
  const catalog = window.allShowsList || allShowsList || [];
  const target = catalog.find(s => (s.showKey || s.title).toLowerCase() === showKey.toLowerCase());
  if (target && typeof window.openShowPlayerPage === 'function') {
    window.openShowPlayerPage(target, 0);
  }
}

/**
 * Handles global search query
 */
export function handleGlobalSearch(query) {
  const q = (query || '').trim().toLowerCase();
  const container = document.getElementById('mainMediaGrid');
  const sectionTitle = document.getElementById('mainSectionTitle');
  const heroSection = document.getElementById('heroBannerSection');

  if (!container) return;

  if (!q) {
    renderActiveView();
    return;
  }

  if (heroSection) heroSection.classList.add('hidden');
  if (sectionTitle) sectionTitle.innerText = `Search Results for "${query}"`;

  const catalog = window.allShowsList || allShowsList || [];
  const results = catalog.filter(show => {
    const title = (show.title || '').toLowerCase();
    const desc = (show.desc || '').toLowerCase();
    const cat = (show.category || '').toLowerCase();
    const eps = (show.episodes || []).some(e => (e.episodeTitle || '').toLowerCase().includes(q) || (e.synopsis || '').toLowerCase().includes(q));
    return title.includes(q) || desc.includes(q) || cat.includes(q) || eps;
  });

  if (results.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-12 text-center text-xs text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
        <i data-lucide="search-x" class="w-8 h-8 text-slate-500"></i>
        <p class="font-bold text-sm text-slate-200">No matches found for "${query}"</p>
        <p class="text-xs text-slate-400">Try searching for anime, kdrama titles, or character names.</p>
      </div>
    `;
    if (window.safeCreateIcons) window.safeCreateIcons(container);
    return;
  }

  container.innerHTML = results.map(show => {
    const safeKey = (show.showKey || show.title).replace(/'/g, "\\'");
    return `
      <div 
        class="group/card relative rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-cyan/50 transition-all duration-300 overflow-hidden shadow-lg flex flex-col cursor-pointer"
        onclick="playShowFromCatalog('${safeKey}')"
      >
        <div class="relative w-full aspect-video bg-slate-900 overflow-hidden">
          <img src="${show.image}" alt="${show.title}" class="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
        </div>
        <div class="p-3.5">
          <h3 class="font-black text-sm text-white group-hover/card:text-brand-cyan transition-colors truncate">${show.title}</h3>
          <p class="text-xs text-slate-400 line-clamp-2 mt-1">${show.desc}</p>
        </div>
      </div>
    `;
  }).join('');

  if (window.safeCreateIcons) window.safeCreateIcons(container);
}

// Global attachments
if (typeof window !== "undefined") {
  window.switchNavTab = switchNavTab;
  window.renderAllViews = renderActiveView;
  window.playShowFromCatalog = playShowFromCatalog;
  window.handleGlobalSearch = handleGlobalSearch;
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderActiveView);
  } else {
    renderActiveView();
  }
}
