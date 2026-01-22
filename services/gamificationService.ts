import { UserStats, Achievement } from '../types';
import { AuthService } from './authService';

const MAX_POINTS = 10000;
export const TASK_REWARD = 50; 

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_streak', title: 'Constância Inicial', description: 'Mantenha o foco por 3 dias seguidos', unlocked: false, icon: '🔥' },
  { id: 'eagle_eye', title: 'Visão de Águia', description: 'Alcance 2.500 pontos', unlocked: false, icon: '🦅' },
  { id: 'module_master', title: 'Mestre da Execução', description: 'Alcance o nível máximo (10.000 pts)', unlocked: false, icon: '🏆' },
  { id: 'biohacker', title: 'Biohacker', description: 'Complete 5 sessões de Timer', unlocked: false, icon: '🧬' },
  { id: 'first_sale', title: 'A Lenda Viva', description: 'Realizou um Marco Extremo (Venda/Meta).', unlocked: false, icon: '💎' }
];

const INITIAL_STATS: UserStats = {
  points: 0,
  level: 1,
  currentStreak: 0,
  lastActiveDate: new Date().toISOString(),
  achievements: INITIAL_ACHIEVEMENTS
};

// Helper to get key specific to current user
const getStorageKey = (): string | null => {
  const userId = AuthService.getCurrentUserId();
  if (!userId) return null;
  return `MENTOR_EVOLUCAO_STATS_${userId}`;
};

export const getUserStats = (): UserStats => {
  const key = getStorageKey();
  if (!key) return INITIAL_STATS; // Fallback for no auth (shouldn't happen in app flow)

  const stored = localStorage.getItem(key);
  if (!stored) return INITIAL_STATS;
  return JSON.parse(stored);
};

export const addPoints = (amount: number): UserStats => {
  const stats = getUserStats();
  
  if (stats.points < MAX_POINTS) {
    stats.points = Math.min(stats.points + amount, MAX_POINTS);
  }
  
  const newLevel = Math.min(Math.floor(stats.points / 500) + 1, 20);
  if (newLevel > stats.level) {
    stats.level = newLevel;
  }

  if (stats.points >= 2500) unlockAchievement(stats, 'eagle_eye');
  if (stats.points >= MAX_POINTS) unlockAchievement(stats, 'module_master');

  saveStats(stats);
  return stats;
};

// New function to handle Chat-based achievements
export const processChatAchievement = (type: 'SIMPLE' | 'HARD' | 'EXTREME'): { points: number, label: string } => {
    let points = 0;
    let label = '';

    switch (type) {
        case 'SIMPLE':
            points = 50;
            label = 'EXECUÇÃO TÉCNICA';
            break;
        case 'HARD':
            points = 100;
            label = 'DISCIPLINA DE FERRO';
            break;
        case 'EXTREME':
            points = 500;
            label = 'MARCO EXTREMO - LENDA';
            const stats = getUserStats();
            unlockAchievement(stats, 'first_sale'); // Auto unlock specific badge if extreme
            saveStats(stats);
            break;
    }

    addPoints(points);
    return { points, label };
};

export const getEagleStage = (points: number): number => {
  if (points >= 10000) return 5;
  if (points >= 7500) return 4;
  if (points >= 5000) return 3;
  if (points >= 2500) return 2;
  if (points >= 1000) return 1;
  return 0;
};

export const getStageName = (points: number): string => {
    const stage = getEagleStage(points);
    const names = ["INICIADO", "DESPERTO", "FOCADO", "DOMINANTE", "SOBERANO", "LENDA"];
    return names[stage] || "INICIADO";
};

export const updateStreak = (): UserStats => {
  const stats = getUserStats();
  const today = new Date().toDateString();
  const lastActive = new Date(stats.lastActiveDate).toDateString();

  if (today !== lastActive) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (new Date(stats.lastActiveDate).toDateString() === yesterday.toDateString()) {
      stats.currentStreak += 1;
    } else {
      stats.currentStreak = 1; 
    }
    stats.lastActiveDate = new Date().toISOString();
    
    if (stats.currentStreak >= 3) unlockAchievement(stats, 'first_streak');
    
    saveStats(stats);
  }
  return stats;
};

export const checkTimerAchievement = (sessionsCompleted: number) => {
    const stats = getUserStats();
    if (sessionsCompleted >= 5) {
        const updated = unlockAchievement(stats, 'biohacker');
        if (updated) saveStats(stats);
    }
}

const unlockAchievement = (stats: UserStats, id: string): boolean => {
  const achievement = stats.achievements.find(a => a.id === id);
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true;
    return true;
  }
  return false;
};

const saveStats = (stats: UserStats) => {
  const key = getStorageKey();
  if (key) {
    localStorage.setItem(key, JSON.stringify(stats));
    window.dispatchEvent(new Event('statsUpdated'));
  }
};