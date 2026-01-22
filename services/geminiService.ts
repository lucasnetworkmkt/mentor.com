import { GoogleGenAI, GenerateContentResponse, Chat, Part, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// --- API KEY MANAGEMENT ---
// HARDCODED KEYS FOR PRODUCTION STABILITY (VERCEL)
const API_KEYS = [
  "AIzaSyDHsKZv9zk5VN9tlqZ9Ffhl294i-BunRD0",
  "AIzaSyAdmzKq5c0PVqur7WygvyblnfsBY8e1rzE",
  "AIzaSyDlazOs2TixDhZrvP9pKZ2F23aABhnhDnw"
];

// Using gemini-2.0-flash for maximum speed and reliability in production
const TEXT_MODEL = "gemini-2.0-flash";

// --- STATE MANAGEMENT ---
let currentChatSession: Chat | null = null;
let currentKeyIndex = 0;

// --- INTERNAL HELPERS ---

/**
 * Creates a client instance with the current active key
 */
const getClient = (): GoogleGenAI => {
  return new GoogleGenAI({ apiKey: API_KEYS[currentKeyIndex] });
};

/**
 * Rotates to the next API key. Returns false if all keys have been exhausted in this cycle.
 */
const rotateKey = (): boolean => {
  const nextIndex = currentKeyIndex + 1;
  if (nextIndex >= API_KEYS.length) {
    currentKeyIndex = 0; // Reset to start, but signal that we did a full loop
    return false; 
  }
  currentKeyIndex = nextIndex;
  console.log(`[Mentor System] Rotating to API Key Index: ${currentKeyIndex}`);
  return true;
};

/**
 * Initializes or Re-initializes the chat session.
 * Preserves history if switching keys due to error.
 */
const initSession = async (history: Content[] = []): Promise<Chat> => {
  const ai = getClient();
  currentChatSession = ai.chats.create({
    model: TEXT_MODEL,
    history: history,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      maxOutputTokens: 1000,
    },
  });
  return currentChatSession;
};

// --- PUBLIC METHODS ---

/**
 * Sends a message to the Mentor with auto-retry and key rotation.
 */
export const sendMessageToGemini = async (
  message: string,
  imagePart?: { mimeType: string; data: string }
): Promise<string> => {
  
  // Prepare content parts
  const parts: Part[] = [{ text: message }];
  if (imagePart) {
    parts.unshift({ inlineData: imagePart });
  }

  // Retry Loop
  let attempts = 0;
  const maxAttempts = API_KEYS.length; // Try each key once

  while (attempts < maxAttempts) {
    try {
      // 1. Get or Create Session
      if (!currentChatSession) {
        await initSession();
      }

      // 2. Send Message
      if (!currentChatSession) throw new Error("Session failed to initialize");
      
      const response: GenerateContentResponse = await currentChatSession.sendMessage({ 
        message: { parts } 
      });

      return response.text || "O Mentor permaneceu em silêncio. Tente novamente.";

    } catch (error: any) {
      console.warn(`[Mentor AI] Error with Key ${currentKeyIndex}:`, error);
      attempts++;

      // 3. Handle Failure: Save History & Rotate Key
      let history: Content[] = [];
      try {
        if (currentChatSession) {
           history = await currentChatSession.getHistory();
        }
      } catch (hErr) {
        console.warn("Could not recover history during failover.");
      }

      // Rotate Key
      const hasNextKey = rotateKey();
      
      // If we have another key, recreate session and loop will retry
      if (hasNextKey || attempts < maxAttempts) {
        await initSession(history);
        continue;
      }
    }
  }

  return "ERRO CRÍTICO: Sistema sobrecarregado. Todas as frequências de comunicação falharam. Aguarde 1 minuto e tente novamente.";
};

/**
 * Generates a Mind Map structure (Stateless request).
 */
export const generateMindMapText = async (topic: string): Promise<string | null> => {
  const prompt = `
    ATUE COMO UM ESTRATEGISTA DE ELITE.
    Crie um Mapa Mental hierárquico (formato de texto identado) para resolver esta confusão: "${topic}".
    
    REGRAS:
    1. Use apenas texto puro.
    2. Use hierarquia com marcadores (-, *, +).
    3. Seja brutalmente prático. Nada de teoria. Apenas ações.
    4. O nível 1 deve ser "OBJETIVO CENTRAL".
    5. O nível 2 são os PILARES.
    6. O nível 3 são as TAREFAS IMEDIATAS.
    
    Retorne APENAS o mapa. Sem introduções.
  `;

  // Try loop for Mind Map as well
  let attempts = 0;
  
  while (attempts < API_KEYS.length) {
    try {
      const ai = getClient();
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt
      });

      return response.text || null;

    } catch (error) {
      console.error("Mind Map generation error:", error);
      attempts++;
      rotateKey();
    }
  }

  return null;
};