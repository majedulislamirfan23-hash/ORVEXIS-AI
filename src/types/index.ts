export type Role = 'user' | 'assistant' | 'system';

export interface ImageAttachment {
  data: string; // Base64 string
  mimeType: string;
  name: string;
  size?: number;
}

export interface DocumentAttachment {
  name: string;
  content: string;
  size: number;
  type: string;
}

export interface WebSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  imageAttachment?: ImageAttachment;
  documentAttachment?: DocumentAttachment;
  sources?: WebSource[];
  searchQueries?: string[];
  isStreaming?: boolean;
  error?: boolean;
  isQuota?: boolean;
  speedMetrics?: {
    tokensPerSec?: number;
    elapsedMs?: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  mode?: string;
  pinned?: boolean;
  tags?: string[];
}

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  category: 'preference' | 'fact' | 'work' | 'identity';
  createdAt: number;
  enabled: boolean;
}

export type ResponseStyle = 'balanced' | 'concise' | 'deep' | 'creative' | 'technical';
export type AppTheme = 'obsidian' | 'cyber-indigo' | 'electric-cyan' | 'neon-amethyst';
export type AccentColor = 'purple' | 'cyan' | 'blue' | 'pink' | 'emerald';
export type FontSize = 'sm' | 'md' | 'lg';
export type VoiceGender = 'female' | 'male' | 'neutral';
export type ThinkingLevelSetting = 'extraordinary' | 'high' | 'balanced' | 'fast';
export type SpeedEngine = 'hyper-fast' | 'quantum-balanced' | 'deep-cognitive';

export interface UserSettings {
  theme: AppTheme;
  accentColor: AccentColor;
  fontSize: FontSize;
  language: string;
  responseStyle: ResponseStyle;
  voiceVoice: string;
  voiceGender: VoiceGender;
  voicePitch: number;
  voiceRate: number;
  autoReadResponses: boolean;
  handsFreeMode: boolean;
  memoryEnabled: boolean;
  webSearchEnabled: boolean;
  soundEffects: boolean;
  userName?: string;
  thinkingLevel?: ThinkingLevelSetting;
  speedEngine?: SpeedEngine;
}

export interface UserProfile {
  name: string;
  callSign: string;
  title: string;
  bio: string;
  avatarIcon: string;
  nativeLanguage: string;
  interests: string[];
  stats: {
    queriesCount: number;
    voiceSessions: number;
    codeModulesBuilt: number;
    memoriesStored: number;
  };
}

export type ActiveView =
  | 'chat'
  | 'explore'
  | 'conversations'
  | 'tools'
  | 'think'
  | 'code'
  | 'study'
  | 'vision'
  | 'create'
  | 'document'
  | 'settings'
  | 'profile'
  | 'about';
