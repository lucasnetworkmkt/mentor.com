export enum AppMode {
  CHAT = 'CHAT',
  MIND_MAP = 'MIND_MAP',
  EXECUTION = 'EXECUTION',
  HISTORY = 'HISTORY'
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string for user uploads or generated images
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastModified: number;
  preview: string;
}

export interface MindMapRequest {
  topic: string;
  context: string;
}

export enum TimerState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}

// Gamification Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface UserStats {
  points: number;
  level: number;
  currentStreak: number;
  lastActiveDate: string; // ISO Date string
  achievements: Achievement[];
}
