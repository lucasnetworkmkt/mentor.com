import { AuthService } from './authService';

export interface StoredMindMap {
  id: string;
  topic: string;
  content: string;
  timestamp: number;
}

// Helper to get key specific to current user
const getStorageKey = (): string | null => {
  const userId = AuthService.getCurrentUserId();
  if (!userId) return null;
  return `MENTOR_EVOLUCAO_MAPS_${userId}`;
};

export const getStoredMindMaps = (): StoredMindMap[] => {
  const key = getStorageKey();
  if (!key) return [];

  const stored = localStorage.getItem(key);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return parsed.sort((a: StoredMindMap, b: StoredMindMap) => b.timestamp - a.timestamp);
  } catch (e) {
    console.error("Failed to parse mind maps", e);
    return [];
  }
};

export const saveMindMap = (topic: string, content: string): StoredMindMap | null => {
  const key = getStorageKey();
  if (!key) return null;

  const maps = getStoredMindMaps();
  
  const newMap: StoredMindMap = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    topic,
    content,
    timestamp: Date.now()
  };

  // Add to beginning
  maps.unshift(newMap);

  // Limit storage to last 50 maps to prevent overflow
  if (maps.length > 50) {
      maps.pop();
  }

  localStorage.setItem(key, JSON.stringify(maps));
  return newMap;
};

export const deleteMindMap = (id: string): StoredMindMap[] => {
    const key = getStorageKey();
    if (!key) return [];

    let maps = getStoredMindMaps();
    maps = maps.filter(m => m.id !== id);
    
    localStorage.setItem(key, JSON.stringify(maps));
    return maps;
};
