export enum CookieStatus {
  Active = 'Active',
  Invalid = 'Invalid',
  Expired = 'Expired'
}

export interface Cookie {
  id: string;
  value: string;
  status: CookieStatus;
  lastUsed: string;
  failureCount: number;
  alias?: string;
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
}

export interface Stats {
  likes: number;
  collects: number;
  comments: number;
  shares: number;
  followerCount?: number;
}

export interface NoteAnalysis {
  viralReasons: string[];
  improvements: string[];
  userPsychology: string;
  summary: string;
}

export interface Note {
  id: string;
  url: string;
  title: string;
  content: string;
  author: string;
  images: string[];
  stats: Stats;
  analysis?: NoteAnalysis;
  group: string;
  crawledAt: string;
}

export interface Group {
  id: string;
  name: string;
  count: number;
}

export interface DashboardMetrics {
  totalNotes: number;
  avgLikes: number;
  activeCookies: number;
  topKeywords: { text: string; value: number }[];
}