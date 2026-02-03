export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface User {
  id: string;
  email: string;
  gemini_api_key?: string;
}

export interface Cookie {
  id: string;
  value: string; // The full cookie string
  status: 'active' | 'invalid' | 'expired';
  lastUsed: string;
  note: string;
}

export interface NoteStats {
  likes: number;
  collects: number;
  comments: number;
  shares: number;
}

export interface Author {
  name: string;
  avatar: string;
  followers: number;
}

export interface NoteData {
  id: string;
  title: string;
  content: string;
  url: string;
  coverImage: string;
  videoUrl?: string;
  stats: NoteStats;
  author: Author;
  postedAt: string;
  groupId?: string; // For folders
}

export interface AIAnalysis {
  viralReasons: string[]; // Why it went viral
  improvements: string[]; // What can be better
  userPsychology: string; // User persona/psychology
  rewriteSuggestion?: string; // AI generated rewrite
  tags: string[];
}

export interface ScrapeResult {
  id: string;
  note: NoteData;
  analysis: AIAnalysis | null;
  scrapedAt: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
