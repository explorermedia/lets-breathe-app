export type BreathingPhase = 'prepare' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhale: number; // seconds
  holdIn: number; // seconds
  exhale: number; // seconds
  holdOut: number; // seconds
  category: 'calm' | 'energize' | 'focus' | 'custom' | 'balanced';
  isCustom?: boolean;
  requiresPremium?: boolean;
}

export interface SessionHistory {
  id: string;
  patternId: string;
  patternName: string;
  date: string; // ISO string
  durationSeconds: number;
  completed: boolean;
  stressBefore?: number; // 1-10
  stressAfter?: number; // 1-10
}

export interface UserSettings {
  masterVolume: number;
  ambientVolume: number;
  ambientSound: 'none' | 'drone' | 'waves' | 'rain';
  cueSound: 'bell' | 'chime' | 'bowl' | 'click';
  theme: string;
  defaultDuration: number; // in seconds, e.g. 180 (3 mins)
  hasCompletedOnboarding: boolean;
  isPremium: boolean;
}

export interface BreathingStats {
  totalMinutes: number;
  sessionsCount: number;
  streakDays: number;
  lastSessionDate: string | null;
}
