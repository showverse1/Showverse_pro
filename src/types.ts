export type VideoCategory = 
  | 'All'
  | 'Kdrama'
  | 'Chinese Drama'
  | 'Anime'
  | 'Movie'
  | 'Indian';

export interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  description: string;
}

export interface Video {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  banner: string;
  category: VideoCategory;
  tags: string[];
  duration: number; // in seconds
  formattedDuration: string;
  releaseYear: number;
  ageRating: 'All' | 'PG-13' | '16+' | 'TV-MA';
  quality: '4K Ultra HD' | '1080p FHD' | '720p HD';
  rating: number; // e.g. 4.9
  views: number;
  likes: number;
  isTrending?: boolean;
  isFeatured?: boolean;
  isOriginal?: boolean;
  isVerse?: boolean; // For vertical / short format verses
  creatorName: string;
  creatorAvatar: string;
  episodes?: Episode[];
  createdAt: string;
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies?: CommentReply[];
}

export interface UserHistoryItem {
  videoId: string;
  progress: number; // 0 to 1 percentage
  currentTime: number; // seconds
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'creator' | 'admin';
  watchLater: string[]; // video IDs
  favorites: string[]; // video IDs
  history: UserHistoryItem[];
}

export type ActiveTab = 
  | 'home' 
  | 'player' 
  | 'watch-later' 
  | 'history' 
  | 'studio' 
  | 'search';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}
