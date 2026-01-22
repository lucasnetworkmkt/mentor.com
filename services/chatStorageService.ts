import { ChatSession, Message } from '../types';
import { AuthService } from './authService';

// Helper to get key specific to current user
const getStorageKey = (): string | null => {
  const userId = AuthService.getCurrentUserId();
  if (!userId) return null;
  return `MENTOR_EVOLUCAO_CHATS_${userId}`;
};

export const getStoredChats = (): ChatSession[] => {
  const key = getStorageKey();
  if (!key) return [];

  const stored = localStorage.getItem(key);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return parsed.sort((a: ChatSession, b: ChatSession) => b.lastModified - a.lastModified);
  } catch (e) {
    console.error("Failed to parse chats", e);
    return [];
  }
};

export const saveChatSession = (id: string, messages: Message[]): void => {
  const key = getStorageKey();
  if (!key || messages.length === 0) return;

  const chats = getStoredChats();
  const existingIndex = chats.findIndex(c => c.id === id);
  
  const firstUserMsg = messages.find(m => m.role === 'user');
  const title = firstUserMsg 
    ? (firstUserMsg.text.length > 30 ? firstUserMsg.text.substring(0, 30) + '...' : firstUserMsg.text) 
    : 'Nova Sessão';

  const preview = messages[messages.length - 1].text.substring(0, 50) + '...';

  const updatedSession: ChatSession = {
    id,
    title: existingIndex >= 0 ? chats[existingIndex].title : title,
    messages,
    lastModified: Date.now(),
    preview
  };

  if (existingIndex >= 0) {
    chats[existingIndex] = updatedSession;
  } else {
    chats.unshift(updatedSession);
  }

  localStorage.setItem(key, JSON.stringify(chats));
};

export const deleteChatSession = (id: string): ChatSession[] => {
    const key = getStorageKey();
    if (!key) return [];

    let chats = getStoredChats();
    chats = chats.filter(c => c.id !== id);
    
    localStorage.setItem(key, JSON.stringify(chats));
    return chats;
};

export const getChatById = (id: string): ChatSession | undefined => {
  const chats = getStoredChats();
  return chats.find(c => c.id === id);
};

export const createNewSessionId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
