import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import MindMapGenerator from './components/MindMapGenerator';
import ExecutionTimer from './components/ExecutionTimer';
import ChatHistoryList from './components/ChatHistoryList';
import ProgressionModal from './components/ProgressionModal';
import LoginScreen from './components/LoginScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import { AppMode } from './types';
import { createNewSessionId, getStoredChats } from './services/chatStorageService';
import { getUserStats } from './services/gamificationService';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [currentChatId, setCurrentChatId] = useState<string>(createNewSessionId());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Progression Modal State
  const [isProgressionOpen, setIsProgressionOpen] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  // Sync points for Modal
  useEffect(() => {
    const update = () => setUserPoints(getUserStats().points);
    update();
    window.addEventListener('statsUpdated', update);
    return () => window.removeEventListener('statsUpdated', update);
  }, [user]);

  const handleStartNewChat = () => {
    const newId = createNewSessionId();
    setCurrentChatId(newId);
    setMode(AppMode.CHAT);
    setIsSidebarOpen(false); // Close sidebar on mobile on action
  };

  const handleResumeChat = () => {
    const chats = getStoredChats();
    if (chats.length > 0) {
      setCurrentChatId(chats[0].id);
    } else {
      setCurrentChatId(createNewSessionId());
    }
    setMode(AppMode.CHAT);
    setIsSidebarOpen(false);
  };

  const handleLoadChat = (id: string) => {
    setCurrentChatId(id);
    setMode(AppMode.CHAT);
    setIsSidebarOpen(false);
  };

  const handleModeChange = (newMode: AppMode) => {
      setMode(newMode);
      setIsSidebarOpen(false);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505]">
      
      {/* Mobile Header Trigger */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-[#050505] border-b border-[#222] z-30 flex items-center justify-between px-4">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#E50914] transform rotate-45"></div>
            <span className="text-white font-black text-sm tracking-tighter italic uppercase">O MENTOR</span>
         </div>
         <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-white p-2 focus:outline-none"
         >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
         </button>
      </div>

      {/* Sidebar Component (Handles its own responsive visibility based on props) */}
      <Sidebar 
        currentMode={mode} 
        setMode={handleModeChange} 
        onResumeChat={handleResumeChat}
        startNewChat={handleStartNewChat} 
        onOpenProgression={() => setIsProgressionOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Main Content Area */}
      <main className="flex-1 h-full relative pt-16 md:pt-0 overflow-hidden w-full">
        
        {/* 
          CRITICAL: We keep ChatInterface ALWAYS mounted but toggle visibility using CSS.
          This ensures that if the user switches to MindMap while the AI is thinking, 
          the state/promise is NOT lost, and the chat continues to update in the background.
        */}
        <div className={`h-full w-full ${mode === AppMode.CHAT ? 'block' : 'hidden'}`}>
            <ChatInterface 
                key={currentChatId} 
                sessionId={currentChatId} 
                isActive={mode === AppMode.CHAT}
            />
        </div>
        
        {mode === AppMode.HISTORY && (
            <ChatHistoryList onSelectChat={handleLoadChat} onNewChat={handleStartNewChat} />
        )}
        
        {mode === AppMode.MIND_MAP && <MindMapGenerator />}
        {mode === AppMode.EXECUTION && <ExecutionTimer />}

        <ProgressionModal 
           isOpen={isProgressionOpen} 
           onClose={() => setIsProgressionOpen(false)}
           currentPoints={userPoints}
        />
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TimerProvider>
        <AppContent />
      </TimerProvider>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="h-screen w-screen bg-[#050505] flex items-center justify-center">
                 <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <LoginScreen />;
    }

    return <MainApp />;
}

export default App;