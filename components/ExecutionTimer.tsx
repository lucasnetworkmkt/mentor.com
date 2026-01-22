import React, { useState, useEffect } from 'react';
import { TimerState } from '../types';
import { useTimer } from '../context/TimerContext';
import { TASK_REWARD } from '../services/gamificationService';

const ExecutionTimer: React.FC = () => {
  const { 
    timeLeft, 
    initialTime, 
    state, 
    task, 
    setTask, 
    startTimer, 
    pauseTimer, 
    resetTimer,
    resolveSession
  } = useTimer();

  // Local state only for editing the time before starting
  const [editMinutes, setEditMinutes] = useState('25');
  const [editSeconds, setEditSeconds] = useState('00');

  // Sync edit inputs when timer is reset externally or initially
  useEffect(() => {
    if (state === TimerState.IDLE) {
        const m = Math.floor(initialTime / 60);
        const s = initialTime % 60;
        setEditMinutes(m.toString());
        setEditSeconds(s.toString().padStart(2, '0'));
    }
  }, [initialTime, state]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
     // If IDLE, we might need to update initial time based on inputs
     if (state === TimerState.IDLE) {
         const m = parseInt(editMinutes) || 0;
         const s = parseInt(editSeconds) || 0;
         const total = (m * 60) + s;
         if (total > 0) {
            startTimer(total);
         }
     } else {
         startTimer(); // Resume
     }
  };
  
  const setPreset = (mins: number) => {
    resetTimer(mins * 60);
  };

  const handleManualTimeChange = (m: string, s: string) => {
    setEditMinutes(m);
    setEditSeconds(s);
    const min = parseInt(m) || 0;
    const sec = parseInt(s) || 0;
    const total = (min * 60) + sec;
    if (total >= 0) {
        // We update the context immediately so the big display updates
        resetTimer(total); 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0A0A0A] p-4 md:p-6 overflow-y-auto w-full">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tighter uppercase">
          Modo Execução
        </h2>
        <p className="text-[#9FB4C7] mb-8 font-mono text-xs md:text-sm px-4">
          CLAREZA SEM AÇÃO É ILUSÃO.
        </p>

        {/* Timer Display / Controls */}
        <div className={`border-2 rounded-2xl p-6 md:p-8 mb-8 transition-colors duration-300 relative overflow-hidden ${
          state === TimerState.RUNNING 
            ? 'border-[#E50914] bg-black shadow-[0_0_30px_rgba(229,9,20,0.15)]' 
            : 'border-[#9FB4C7]/30 bg-[#0F0F0F]'
        }`}>
            {state === TimerState.COMPLETED && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-20 animate-fade-in p-6">
                    <div className="text-center w-full">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFD700] rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="black" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                             </svg>
                        </div>
                        <p className="text-[#FFD700] font-bold text-lg md:text-xl mb-1 uppercase tracking-widest">A Verdade</p>
                        <p className="text-white text-xs md:text-sm mb-6 font-mono break-words">
                            Você executou a missão? <br/> <span className="text-[#E50914] font-bold line-clamp-2">"{task}"</span>
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <button 
                                onClick={() => resolveSession(false)}
                                className="bg-transparent border border-[#333] hover:border-[#666] text-[#666] hover:text-white px-3 py-2 md:py-3 rounded font-bold uppercase tracking-wider text-xs transition-all"
                            >
                                NÃO
                                <span className="block text-[8px] opacity-60 mt-1">0 PONTOS</span>
                            </button>

                            <button 
                                onClick={() => resolveSession(true)}
                                className="bg-[#E50914] text-white px-3 py-2 md:py-3 rounded font-bold hover:bg-red-700 uppercase tracking-wider text-xs shadow-lg shadow-red-900/20 transition-all transform hover:scale-105"
                            >
                                SIM
                                <span className="block text-[8px] opacity-80 mt-1">+{TASK_REWARD} PONTOS</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

          {state === TimerState.IDLE ? (
             <div className="flex justify-center items-center gap-1 md:gap-2 mb-6 text-6xl md:text-8xl font-mono font-bold text-[#9FB4C7]">
                <input 
                    type="number" 
                    value={editMinutes}
                    onChange={(e) => handleManualTimeChange(e.target.value, editSeconds)}
                    className="bg-transparent text-right w-24 md:w-32 focus:text-white focus:outline-none placeholder-gray-700"
                    placeholder="25"
                />
                <span className="pb-2 text-4xl md:text-6xl">:</span>
                <input 
                    type="number" 
                    value={editSeconds}
                    onChange={(e) => handleManualTimeChange(editMinutes, e.target.value)}
                    className="bg-transparent text-left w-24 md:w-32 focus:text-white focus:outline-none placeholder-gray-700"
                    placeholder="00"
                />
             </div>
          ) : (
            <div className={`text-6xl md:text-8xl font-mono font-bold mb-6 tabular-nums tracking-widest ${state === TimerState.PAUSED ? 'text-[#FFD700] animate-pulse' : 'text-white'}`}>
                {formatTime(timeLeft)}
            </div>
          )}
          
          <div className="mb-6 flex justify-center gap-2 flex-wrap">
            {[5, 25, 50].map(min => (
                <button 
                    key={min}
                    onClick={() => setPreset(min)}
                    disabled={state === TimerState.RUNNING}
                    className="px-3 py-2 rounded text-xs font-bold uppercase border border-[#9FB4C7]/30 text-[#9FB4C7] hover:border-[#E50914] hover:text-[#E50914] transition-all disabled:opacity-20 flex-1 md:flex-none"
                >
                    {min} min
                </button>
            ))}
          </div>

          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            disabled={state !== TimerState.IDLE}
            placeholder="O QUE VOCÊ VAI ENTREGAR?"
            className="w-full bg-transparent border-b border-[#9FB4C7]/30 text-center text-white placeholder-[#9FB4C7]/50 focus:outline-none focus:border-[#E50914] mb-8 pb-2 disabled:opacity-50 text-sm md:text-base"
          />
          
          <div className="flex justify-center gap-4">
            {state === TimerState.RUNNING ? (
              <button onClick={pauseTimer} className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white border border-[#9FB4C7]/30 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>
              </button>
            ) : (
              <button onClick={handleStart} className="bg-white text-black hover:bg-[#FFD700] hover:scale-105 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all shadow-lg shadow-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10 ml-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
              </button>
            )}
            
            <button onClick={() => setPreset(25)} className="border border-[#9FB4C7]/30 text-[#9FB4C7] hover:text-white hover:border-white w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionTimer;