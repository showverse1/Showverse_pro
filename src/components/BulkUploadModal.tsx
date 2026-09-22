import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Upload, 
  HelpCircle,
  Film,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VideoCategory } from '../types';

interface BulkRowItem {
  id: string;
  title: string;
  category: VideoCategory;
  videoUrl: string;
  thumbnail: string;
  quality: '4K Ultra HD' | '1080p FHD' | '720p HD';
  tags: string;
  tagline: string;
}

const CATEGORIES: VideoCategory[] = ['Anime', 'Kdrama', 'Chinese Drama', 'Movie', 'Indian'];

const DEFAULT_STREAM = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80';

const BULK_SAMPLE_PRESETS: Omit<BulkRowItem, 'id'>[] = [
  {
    title: 'Attack on Titan: The Final Season',
    category: 'Anime',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    quality: '4K Ultra HD',
    tags: 'Anime, Action, Dark Fantasy',
    tagline: 'The war for Paradis enters its apocalyptic final phase.'
  },
  {
    title: 'Crash Landing on You: Special Edition',
    category: 'Kdrama',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    quality: '4K Ultra HD',
    tags: 'Kdrama, Romance, Drama',
    tagline: 'A whirlwind romance that crosses forbidden borders.'
  },
  {
    title: 'Love Between Fairy and Devil',
    category: 'Chinese Drama',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    quality: '4K Ultra HD',
    tags: 'Chinese Drama, Xianxia, Fantasy',
    tagline: 'The resurrected Moon Supreme encounters an immortal orchid fairy.'
  },
  {
    title: 'Interstellar: 10th Anniversary Remaster',
    category: 'Movie',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    quality: '4K Ultra HD',
    tags: 'Movie, Sci-Fi, Space, Blockbuster',
    tagline: 'Mankinds next step will be our greatest.'
  },
  {
    title: 'Sacred Games: Mumbai Noir',
    category: 'Indian',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80',
    quality: '4K Ultra HD',
    tags: 'Indian, Crime, Thriller, Noir',
    tagline: 'A phone call in the dark gives Sartaj Singh 25 days to save the city.'
  }
];

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose }) => {
  const { addBulkVideos, showToast, user } = useApp();
  const [activeTab, setActiveTab] = useState<'table' | 'text'>('table');

  // Table rows state
  const [rows, setRows] = useState<BulkRowItem[]>([
    {
      id: 'row-1',
      title: '',
      category: 'Anime',
      videoUrl: DEFAULT_STREAM,
      thumbnail: DEFAULT_THUMBNAIL,
      quality: '4K Ultra HD',
      tags: 'Anime, Action',
      tagline: ''
    },
    {
      id: 'row-2',
      title: '',
      category: 'Kdrama',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      quality: '4K Ultra HD',
      tags: 'Kdrama, Romance',
      tagline: ''
    }
  ]);

  // Text / CSV mode state
  const [rawText, setRawText] = useState('');

  if (!isOpen) return null;

  // Row management
  const handleAddRow = () => {
    const newId = `row-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setRows(prev => [
      ...prev,
      {
        id: newId,
        title: '',
        category: 'Anime',
        videoUrl: DEFAULT_STREAM,
        thumbnail: DEFAULT_THUMBNAIL,
        quality: '4K Ultra HD',
        tags: 'Anime',
        tagline: ''
      }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length === 1) {
      showToast('At least one row is required', 'warning');
      return;
    }
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleRowChange = (id: string, field: keyof BulkRowItem, value: any) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleApplyCategoryToAll = (cat: VideoCategory) => {
    setRows(prev => prev.map(r => ({ ...r, category: cat })));
    showToast(`Set all rows to ${cat}`, 'info');
  };

  const handleLoadSampleBatch = () => {
    const sampleRows: BulkRowItem[] = BULK_SAMPLE_PRESETS.map((preset, idx) => ({
      ...preset,
      id: `sample-${Date.now()}-${idx}`
    }));
    setRows(sampleRows);
    showToast('Loaded 5 multi-category sample videos (Anime, Kdrama, Chinese Drama, Movie, Indian)', 'success');
  };

  // Text parser
  const handleFillSampleText = () => {
    const sampleTextLines = [
      'Solo Leveling S2 | Anime | https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 | https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80 | Anime, Action, Fantasy',
      'The Glory Part 2 | Kdrama | https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4 | https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80 | Kdrama, Revenge, Thriller',
      'Till the End of the Moon | Chinese Drama | https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4 | https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80 | Chinese Drama, Xianxia, Romance',
      'RRR: Rise Roar Revolt | Indian | https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4 | https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80 | Indian, Action, Historical',
      'Oppenheimer: IMAX Cut | Movie | https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4 | https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80 | Movie, Biography, Drama'
    ].join('\n');
    setRawText(sampleTextLines);
    showToast('Filled sample text for quick import', 'info');
  };

  const parseTextRows = () => {
    if (!rawText.trim()) return [];
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    
    return lines.map((line, idx) => {
      const parts = line.split('|').map(p => p.trim());
      const title = parts[0] || `Stream Title #${idx + 1}`;
      
      // Normalize category
      let category: VideoCategory = 'Anime';
      const rawCat = (parts[1] || '').toLowerCase();
      if (rawCat.includes('anime')) category = 'Anime';
      else if (rawCat.includes('kdrama') || rawCat.includes('k-drama')) category = 'Kdrama';
      else if (rawCat.includes('chinese') || rawCat.includes('cdrama') || rawCat.includes('c-drama')) category = 'Chinese Drama';
      else if (rawCat.includes('indian') || rawCat.includes('hindi') || rawCat.includes('bollywood')) category = 'Indian';
      else if (rawCat.includes('movie') || rawCat.includes('film')) category = 'Movie';

      const videoUrl = parts[2] || DEFAULT_STREAM;
      const thumbnail = parts[3] || DEFAULT_THUMBNAIL;
      const tags = parts[4] ? parts[4].split(',').map(t => t.trim()) : [category, 'Featured'];

      return {
        title,
        category,
        videoUrl,
        thumbnail,
        tags,
        tagline: `${category} release on ShowVerse Pro`
      };
    });
  };

  // Submission handler
  const handlePublishAll = () => {
    let itemsToPublish: Array<{
      title: string;
      category: VideoCategory;
      videoUrl: string;
      thumbnail: string;
      banner: string;
      tags: string[];
      tagline: string;
      description: string;
      quality: '4K Ultra HD' | '1080p FHD' | '720p HD';
      ageRating: 'All' | 'PG-13' | '16+' | 'TV-MA';
      duration: number;
      formattedDuration: string;
      releaseYear: number;
      rating: number;
      isTrending: boolean;
      isFeatured: boolean;
      isOriginal: boolean;
      isVerse: boolean;
      creatorName: string;
      creatorAvatar: string;
    }> = [];

    if (activeTab === 'table') {
      const validRows = rows.filter(r => r.title.trim().length > 0);
      if (validRows.length === 0) {
        showToast('Please enter a title for at least one video row', 'warning');
        return;
      }

      itemsToPublish = validRows.map(r => {
        const tags = r.tags
          ? r.tags.split(',').map(t => t.trim()).filter(Boolean)
          : [r.category, 'Featured'];

        return {
          title: r.title.trim(),
          category: r.category,
          videoUrl: r.videoUrl.trim() || DEFAULT_STREAM,
          thumbnail: r.thumbnail.trim() || DEFAULT_THUMBNAIL,
          banner: r.thumbnail.trim() || DEFAULT_THUMBNAIL,
          tags,
          tagline: r.tagline.trim() || `${r.category} special release`,
          description: `Watch high definition ${r.category} stream "${r.title}". Available in ${r.quality}.`,
          quality: r.quality,
          ageRating: '16+',
          duration: 2700,
          formattedDuration: '45m 00s',
          releaseYear: new Date().getFullYear(),
          rating: 4.9,
          isTrending: true,
          isFeatured: false,
          isOriginal: true,
          isVerse: false,
          creatorName: user.name || 'Admin',
          creatorAvatar: user.avatar
        };
      });
    } else {
      // Text mode
      const parsed = parseTextRows();
      if (parsed.length === 0) {
        showToast('Please enter text or click "Fill Sample Template"', 'warning');
        return;
      }

      itemsToPublish = parsed.map(p => ({
        title: p.title,
        category: p.category,
        videoUrl: p.videoUrl,
        thumbnail: p.thumbnail,
        banner: p.thumbnail,
        tags: p.tags,
        tagline: p.tagline,
        description: `Official ${p.category} release on ShowVerse Pro. Stream in crystal clear quality.`,
        quality: '4K Ultra HD',
        ageRating: '16+',
        duration: 3000,
        formattedDuration: '50m 00s',
        releaseYear: new Date().getFullYear(),
        rating: 4.9,
        isTrending: true,
        isFeatured: false,
        isOriginal: true,
        isVerse: false,
        creatorName: user.name || 'Admin',
        creatorAvatar: user.avatar
      }));
    }

    // Add all to state
    addBulkVideos(itemsToPublish);
    onClose();
  };

  // Category badge color helper
  const getCategoryBadgeClass = (cat: VideoCategory) => {
    switch (cat) {
      case 'Anime':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Kdrama':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Chinese Drama':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Movie':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Indian':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const parsedTextPreview = activeTab === 'text' ? parseTextRows() : [];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                  Bulk Video Upload & Multi-Category Publisher
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Exact Category Routing
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Upload multiple titles at once. Whichever category you choose for each video (Anime, Kdrama, Chinese Drama, Movie, Indian), it will show up directly in that category!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls & Bulk Actions */}
        <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'table'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Row-by-Row Multi Editor ({rows.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'text'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Quick Paste (CSV / Text)</span>
            </button>
          </div>

          {activeTab === 'table' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <span>Set All To:</span>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleApplyCategoryToAll(cat)}
                    className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[10px] font-medium transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={handleLoadSampleBatch}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-colors ml-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Demo Batch</span>
              </button>
            </div>
          )}

          {activeTab === 'text' && (
            <button
              onClick={handleFillSampleText}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Sample Template</span>
            </button>
          )}
        </div>

        {/* Modal Body Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {activeTab === 'table' ? (
            <div className="space-y-3">
              {rows.map((row, idx) => (
                <div 
                  key={row.id}
                  className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-mono font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-zinc-200">
                        {row.title ? row.title : `Video #${idx + 1}`}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getCategoryBadgeClass(row.category)}`}>
                        Will appear in: {row.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveRow(row.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                    
                    {/* Title */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                        Video Title *
                      </label>
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) => handleRowChange(row.id, 'title', e.target.value)}
                        placeholder="e.g. Solo Leveling Episode 1"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Category Selector (Crucial!) */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                        Target Category *
                      </label>
                      <select
                        value={row.category}
                        onChange={(e) => handleRowChange(row.id, 'category', e.target.value as VideoCategory)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-semibold focus:outline-none focus:border-amber-500"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quality */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                        Quality
                      </label>
                      <select
                        value={row.quality}
                        onChange={(e) => handleRowChange(row.id, 'quality', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="4K Ultra HD">4K Ultra HD</option>
                        <option value="1080p FHD">1080p FHD</option>
                        <option value="720p HD">720p HD</option>
                      </select>
                    </div>

                    {/* Tags */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={row.tags}
                        onChange={(e) => handleRowChange(row.id, 'tags', e.target.value)}
                        placeholder="Anime, Shonen, Action"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Video URL */}
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                        Stream MP4 / HLS URL
                      </label>
                      <input
                        type="text"
                        value={row.videoUrl}
                        onChange={(e) => handleRowChange(row.id, 'videoUrl', e.target.value)}
                        placeholder="https://.../video.mp4"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                      />
                    </div>

                    {/* Thumbnail URL */}
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                        Cover Thumbnail Image URL
                      </label>
                      <input
                        type="text"
                        value={row.thumbnail}
                        onChange={(e) => handleRowChange(row.id, 'thumbnail', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                      />
                    </div>

                  </div>
                </div>
              ))}

              <button
                onClick={handleAddRow}
                className="w-full py-3 rounded-xl border border-dashed border-zinc-700 hover:border-amber-500/60 bg-zinc-950/40 hover:bg-zinc-950/80 text-xs font-bold text-zinc-300 hover:text-amber-400 flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Video Row</span>
              </button>
            </div>
          ) : (
            /* Quick Text / CSV Mode */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <HelpCircle className="w-4 h-4" />
                  <span>Text Format Instructions</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Paste one video per line separated by pipe (<code className="text-amber-400 font-mono">|</code>):
                </p>
                <p className="font-mono text-[11px] text-zinc-300 bg-zinc-900 p-2 rounded border border-zinc-800">
                  Title | Category (Anime / Kdrama / Chinese Drama / Movie / Indian) | VideoURL | ThumbnailURL | Tags
                </p>
              </div>

              <div>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Attack on Titan | Anime | https://...mp4 | https://...jpg | Anime, Action\nQueen of Tears | Kdrama | https://...mp4 | https://...jpg | Kdrama, Romance\nMirzapur | Indian | https://...mp4 | https://...jpg | Indian, Crime`}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {parsedTextPreview.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Parsed Preview ({parsedTextPreview.length} items detected):</span>
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-zinc-800/40">
                    {parsedTextPreview.map((item, idx) => (
                      <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                        <span className="text-white font-medium truncate max-w-sm">
                          {idx + 1}. {item.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-200">Category Destination:</span>
            <span>Videos will instantly display in their respective sections upon publishing.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublishAll}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>
                Publish All {activeTab === 'table' ? rows.filter(r => r.title.trim()).length : parsedTextPreview.length} Videos
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
