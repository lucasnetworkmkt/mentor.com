import React, { useEffect, useState } from 'react';
import { AppMode, UserStats } from '../types';
import { getUserStats, getStageName } from '../services/gamificationService';
import { useAuth } from '../context/AuthContext';
import EagleBadge from './EagleBadge';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  startNewChat: () => void;
  onResumeChat: () => void;
  onOpenProgression: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    currentMode, 
    setMode, 
    onResumeChat, 
    onOpenProgression, 
    isOpen, 
    onClose 
}) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats>(getUserStats());

  useEffect(() => {
    setStats(getUserStats());
    const handleStatsUpdate = () => {
      setStats(getUserStats());
    };
    window.addEventListener('statsUpdated', handleStatsUpdate);
    return () => window.removeEventListener('statsUpdated', handleStatsUpdate);
  }, [user]);

  const displayId = user ? user.id.split('_')[1].toUpperCase().substring(0, 8) : 'UNK';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#050505] border-r border-[#222] flex flex-col h-screen transform transition-transform duration-300 ease-in-out font-sans
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:w-80 md:flex-shrink-0
      `}>
        
        {/* Header Logo Area */}
        <div className="p-6 pb-2 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-[#E50914] transform rotate-45"></div>
              <h1 className="text-white font-black text-lg tracking-tighter uppercase italic">
                O MENTOR
              </h1>
            </div>
            <div className="pl-6">
                <p className="text-[12px] text-white font-bold truncate">{user?.name || 'Recruta'}</p>
                <p className="text-[10px] text-[#666] font-mono">ID: {displayId}</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-[#666] p-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile / Rank Card - Clickable Trigger */}
        <div className="px-4 py-4">
            <button 
                onClick={() => { onOpenProgression(); onClose(); }}
                className="w-full text-left bg-[#111] border border-[#222] rounded-lg p-4 relative overflow-hidden group hover:border-[#E50914] hover:bg-[#151515] transition-all duration-300 cursor-pointer"
            >
            {/* Subtle Glow */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#E50914] blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
            
            <div className="flex justify-between items-start mb-4">
                <div>
                <p className="text-[10px] text-[#666] uppercase tracking-widest font-bold mb-1 group-hover:text-[#999]">PATENTE</p>
                <h2 className="text-white font-black text-xl tracking-tight uppercase group-hover:text-[#E50914] transition-colors">
                    {getStageName(stats.points)}
                </h2>
                </div>
                <div className="bg-[#0A0A0A] p-2 rounded border border-[#222] group-hover:border-[#E50914]/30 transition-colors">
                <EagleBadge points={stats.points} size="sm" />
                </div>
            </div>
            
            <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono font-bold">
                <span className="text-[#999]">NÍVEL {stats.level}</span>
                <span className="text-[#FFD700]">{stats.points} PTS</span>
                </div>
                <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden">
                    <div 
                    className="h-full bg-[#E50914]" 
                    style={{ width: `${Math.min((stats.points / 10000) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#666" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </div>
            </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
            
            {/* Section 1 */}
            <div>
            <p className="text-[10px] text-[#444] font-bold uppercase tracking-widest mb-3 pl-2">
                COMANDO CENTRAL
            </p>
            <div className="space-y-1">
                <button
                onClick={onResumeChat}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold transition-all ${
                    currentMode === AppMode.CHAT
                    ? 'bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                    : 'text-[#888] hover:text-white hover:bg-[#111]'
                }`}
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                DIREÇÃO (CHAT)
                </button>
            </div>
            </div>

            {/* Section 2 */}
            <div>
            <p className="text-[10px] text-[#444] font-bold uppercase tracking-widest mb-3 pl-2">
                FERRAMENTAS
            </p>
            <div className="space-y-1">
                <button
                onClick={() => setMode(AppMode.HISTORY)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold transition-all ${
                    currentMode === AppMode.HISTORY
                    ? 'bg-[#E50914] text-white'
                    : 'text-[#888] hover:text-white hover:bg-[#111]'
                }`}
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                HISTÓRICO
                </button>

                <button
                onClick={() => setMode(AppMode.MIND_MAP)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold transition-all ${
                    currentMode === AppMode.MIND_MAP
                    ? 'bg-[#E50914] text-white'
                    : 'text-[#888] hover:text-white hover:bg-[#111]'
                }`}
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                </svg>
                MAPAS MENTAIS
                </button>

                <button
                onClick={() => setMode(AppMode.EXECUTION)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold transition-all ${
                    currentMode === AppMode.EXECUTION
                    ? 'bg-[#E50914] text-white'
                    : 'text-[#888] hover:text-white hover:bg-[#111]'
                }`}
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                EXECUÇÃO
                </button>
            </div>
            </div>
        </nav>

        {/* Footer Area */}
        <div className="p-4 bg-[#050505] pb-safe">
            <button 
                onClick={logout}
                className="flex items-center gap-2 text-[10px] text-[#444] font-bold uppercase hover:text-white transition-colors mb-4 w-full"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            ENCERRAR SESSÃO
            </button>

            <div className="border border-[#222] bg-[#0A0A0A] p-4 rounded text-center relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#0A0A0A] px-2 text-[#E50914]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z" />
                </svg>
            </div>
            <p className="text-[10px] text-[#666] font-mono font-bold pt-2">
                "A DOR PASSA. A HONRA FICA."
            </p>
            </div>
        </div>

      </div>
    </>
  );
};

export default Sidebar;