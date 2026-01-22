import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { INITIAL_GREETING } from '../constants';
import { addPoints, updateStreak, processChatAchievement } from '../services/gamificationService';
import { saveChatSession, getChatById } from '../services/chatStorageService';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  sessionId: string;
  isActive: boolean;
}

interface AchievementNotification {
    visible: boolean;
    points: number;
    label: string;
    type: 'SIMPLE' | 'HARD' | 'EXTREME';
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId, isActive }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Achievement Notification State
  const [notification, setNotification] = useState<AchievementNotification>({
      visible: false,
      points: 0,
      label: '',
      type: 'SIMPLE'
  });

  // Initial Load
  useEffect(() => {
    const storedChat = getChatById(sessionId);
    if (storedChat) {
      setMessages(storedChat.messages);
    } else {
      setMessages([{
        id: 'init',
        role: 'model',
        text: INITIAL_GREETING,
        timestamp: Date.now()
      }]);
    }
    updateStreak();
  }, [sessionId]);

  // Save & Scroll Logic
  useEffect(() => {
    if (messages.length > 0) {
      saveChatSession(sessionId, messages);
    }
    
    // Only scroll if the chat is currently visible to the user
    if (isActive) {
        scrollToBottom();
    }
  }, [messages, sessionId, isActive]);

  useEffect(() => {
      if (notification.visible) {
          const timer = setTimeout(() => {
              setNotification(prev => ({ ...prev, visible: false }));
          }, 4000);
          return () => clearTimeout(timer);
      }
  }, [notification.visible]);

  const scrollToBottom = () => {
    // Small timeout ensures DOM is rendered before scrolling
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const parseAndProcessResponse = (fullText: string): string => {
      // Regex to find hidden tags: ||ACHIEVEMENT_TYPE||
      const regex = /\|\|ACHIEVEMENT_(SIMPLE|HARD|EXTREME)\|\|/;
      const match = fullText.match(regex);

      if (match) {
          const type = match[1] as 'SIMPLE' | 'HARD' | 'EXTREME';
          
          // Execute gamification logic
          const result = processChatAchievement(type);
          
          // Show Toast
          setNotification({
              visible: true,
              points: result.points,
              label: result.label,
              type: type
          });

          // Return text WITHOUT the tag
          return fullText.replace(regex, '').trim();
      }

      return fullText;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    // User gets small points for interaction, major points come from AI judgment
    addPoints(2);

    try {
      // API call happens here. Since component remains mounted (hidden), 
      // this await will complete even if user switches tabs.
      const rawResponse = await sendMessageToGemini(userMsg.text);
      
      // Intercept and process achievements
      const cleanResponse = parseAndProcessResponse(rawResponse);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: cleanResponse,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
         id: (Date.now() + 1).toString(),
         role: 'model',
         text: "Ocorreu um erro ao processar. Verifique sua conexão.",
         timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-[#e5e5e5] font-sans relative">
      
      {/* Achievement Toast Notification */}
      {notification.visible && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
              <div className={`
                  flex items-center gap-4 px-6 py-4 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 backdrop-blur-md
                  ${notification.type === 'EXTREME' 
                      ? 'bg-red-900/90 border-[#FFD700]' 
                      : 'bg-[#1a1a1a]/95 border-[#E50914]'
                  }
              `}>
                  <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                      ${notification.type === 'EXTREME' ? 'bg-[#FFD700] text-black' : 'bg-[#E50914] text-white'}
                  `}>
                      +
                  </div>
                  <div>
                      <p className={`text-xs font-bold tracking-widest uppercase ${notification.type === 'EXTREME' ? 'text-[#FFD700]' : 'text-[#E50914]'}`}>
                          {notification.label}
                      </p>
                      <p className="text-white font-black text-xl italic">
                          +{notification.points} PONTOS
                      </p>
                  </div>
              </div>
          </div>
      )}

      {/* Chat Area - Grows to fill available space */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[95%] md:max-w-4xl ${
              msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            {/* Label */}
            <div className="mb-2 flex items-center gap-2">
                {msg.role === 'model' && (
                    <div className="w-3 h-3 border border-[#E50914] rounded-sm flex items-center justify-center">
                        <div className="w-1 h-1 bg-[#E50914]"></div>
                    </div>
                )}
                {msg.role === 'user' && (
                    <div className="w-3 h-3 border border-[#444] rounded-sm flex items-center justify-center">
                        <div className="w-1 h-1 bg-[#444]"></div>
                    </div>
                )}
                <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.role === 'model' ? 'text-[#E50914]' : 'text-[#666]'}`}>
                    {msg.role === 'model' ? 'O MENTOR' : 'VOCÊ'}
                </span>
            </div>

            {/* Bubble */}
            <div
              className={`p-4 md:p-6 rounded-lg border text-sm md:text-base leading-relaxed w-full ${
                msg.role === 'user'
                  ? 'bg-[#1a1a1a] border-[#333] text-gray-200'
                  : 'bg-[#0f0f0f] border-l-2 border-l-[#E50914] border-t-0 border-r-0 border-b-0 shadow-lg'
              }`}
            >
              <div className="prose prose-invert max-w-none 
                prose-headings:text-[#e5e5e5] prose-headings:font-bold prose-headings:uppercase prose-headings:text-sm prose-headings:tracking-wide prose-headings:mb-2
                prose-p:text-[#ccc] prose-p:mb-4
                prose-strong:text-white prose-strong:font-black
                prose-ul:my-2 prose-li:text-[#ccc]
                marker:text-[#E50914]">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
            <div className="flex flex-col items-start max-w-4xl mr-auto">
                 <div className="mb-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E50914]">O MENTOR</span>
                 </div>
                 <div className="bg-[#0f0f0f] p-4 border-l-2 border-[#E50914] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#E50914] animate-pulse"></span>
                    <span className="text-xs text-[#666] font-mono uppercase">Analisando Execução...</span>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area - Fixed at bottom via Flexbox, NOT absolute */}
      <div className="flex-none bg-[#0A0A0A] border-t border-[#222] p-4 md:p-6 w-full z-10 pb-safe">
        <div className="max-w-4xl mx-auto flex gap-0 shadow-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Relate sua vitória ou peça direção..."
            className="flex-1 bg-[#1a1a1a] text-white border border-[#333] border-r-0 rounded-l-md px-4 py-4 focus:outline-none focus:bg-[#222] placeholder-[#555] font-sans text-sm md:text-base min-w-0"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-[#E50914] text-white px-4 md:px-8 py-4 font-bold uppercase tracking-wider text-xs rounded-r-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <span className="hidden md:inline">ENVIAR</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
               <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;