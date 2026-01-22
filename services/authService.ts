import { UserProfile } from '../types';

const USERS_DB_KEY = 'MENTOR_EVOLUCAO_USERS_DB';
const SESSION_KEY = 'MENTOR_EVOLUCAO_SESSION';

// Simple "Encryption" for demo purposes (Base64). 
// In a real backend, this would be handled by hashing libraries like bcrypt.
const hashPassword = (password: string): string => {
  return btoa(password + "_MENTOR_SALT");
};

// Strict Email Validation Regex
// Ensures standard format: chars@domain.tld
// Rejects accents (í, ã, etc) and ensures valid TLD length.
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

interface StoredUser extends UserProfile {
  passwordHash: string;
}

const getUsersDB = (): Record<string, StoredUser> => {
  const stored = localStorage.getItem(USERS_DB_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveUsersDB = (db: Record<string, StoredUser>) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
};

export const AuthService = {
  login: (email: string, password: string): UserProfile => {
    const db = getUsersDB();
    const normalizedEmail = email.trim().toLowerCase();
    
    // Validate format immediately to fail fast
    if (!isValidEmail(normalizedEmail)) {
       throw new Error("Formato de e-mail inválido.");
    }

    // Find user by normalized email (Values search)
    const user = Object.values(db).find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error("Conta não encontrada. Verifique o e-mail ou cadastre-se.");
    }

    if (user.passwordHash !== hashPassword(password)) {
      throw new Error("Credenciais inválidas. Tente novamente.");
    }

    // Create Session
    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    return profile;
  },

  register: (name: string, email: string, password: string): UserProfile => {
    const db = getUsersDB();
    const normalizedEmail = email.trim().toLowerCase();
    
    // 1. Strict Format Validation
    if (!isValidEmail(normalizedEmail)) {
        throw new Error("E-mail inválido. Use um endereço real (sem acentos/espaços).");
    }

    // 2. Check if email exists (Case insensitive check)
    if (Object.values(db).some(u => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error("Este e-mail já está em uso. Faça login.");
    }

    if (password.length < 6) {
        throw new Error("A senha deve ter no mínimo 6 caracteres.");
    }

    const newUser: StoredUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      email: normalizedEmail,
      createdAt: Date.now(),
      passwordHash: hashPassword(password)
    };

    // Use ID as key for O(1) lookups by ID, though we login by email
    db[newUser.id] = newUser;
    saveUsersDB(db);

    // Auto login
    const profile: UserProfile = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    
    return profile;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): UserProfile | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  getCurrentUserId: (): string | null => {
    const user = AuthService.getCurrentUser();
    return user ? user.id : null;
  }
};