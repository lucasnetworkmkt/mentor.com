import React, { useRef, useEffect } from 'react';
import { getEagleStage } from '../services/gamificationService';
import EagleBadge from './EagleBadge';

interface ProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number;
}

const MILESTONES = [
  { points: 0, label: "INÍCIO", description: "O primeiro passo.", iconType: 'eagle' },
  { points: 500, label: "DESPERTAR", description: "Saindo da inércia.", iconType: 'shield' },
  { points: 1000, label: "CONSISTÊNCIA", description: "Disciplina instalada.", iconType: 'lock' },
  { points: 2500, label: "APRENDIZ", description: "Expansão de consciência.", iconType: 'lock' },
  { points: 5000, label: "PRATICANTE", description: "Domínio das ferramentas.", iconType: 'lock' },
  { points: 7500, label: "DOMÍNIO", description: "Alta performance.", iconType: 'lock' },
  { points: 10000, label: "AUTORIDADE", description: "A lenda viva.", iconType: 'crown' }
];

const ProgressionModal: React.FC<ProgressionModalProps> = ({ isOpen, onClose, currentPoints }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  // Calculate Logic
  const nextMilestoneIndex = MILESTONES.findIndex(m => m.points > currentPoints);
  const nextMilestone = nextMilestoneIndex !== -1 ? MILESTONES[nextMilestoneIndex] : null;
  const pointsNeeded = nextMilestone ? nextMilestone.points - currentPoints : 0;
  
  // Calculate Progress Bar Width (Equidistant visual steps)
  // Determine which segment we are in
  let currentSegmentIndex = 0;
  let segmentProgress = 0;

  if (currentPoints >= 10000) {
      currentSegmentIndex = MILESTONES.length - 1;
      segmentProgress = 1; // Full
  } else {
      for (let i = 0; i < MILESTONES.length - 1; i++) {
          if (currentPoints >= MILESTONES[i].points && currentPoints < MILESTONES[i+1].points) {
              currentSegmentIndex = i;
              const range = MILESTONES[i+1].points - MILESTONES[i].points;
              const gained = currentPoints - MILESTONES[i].points;
              segmentProgress = gained / range;
              break;
          }
      }
  }
  
  const totalSegments = MILESTONES.length - 1;
  const visualPercentage = Math.min(100, ((currentSegmentIndex + segmentProgress) / totalSegments) * 100);


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4 animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#333] w-full max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[90dvh] h-auto overflow-hidden">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-[#333] flex justify-between items-center bg-[#0A0A0A] rounded-t-xl shrink-0">
          <div>
             <h2 className="text-white font-black text-lg md:text-xl uppercase tracking-wider flex items-center gap-2">
                <span className="text-[#FFD700]">🏆</span> CAMINHO DA EVOLUÇÃO
             </h2>
             <p className="text-[10px] text-[#666] font-mono mt-1">MAPA DE PROGRESSÃO VISUAL</p>
          </div>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-[#111] p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222] shrink-0">
           <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#333] bg-[#050505] flex items-center justify-center shrink-0">
                 <EagleBadge points={currentPoints} size="sm" />
              </div>
              <div>
                 <p className="text-[10px] text-[#666] uppercase font-bold">STATUS ATUAL</p>
                 <p className="text-xl md:text-2xl font-black text-white">{currentPoints} PTS</p>
              </div>
           </div>
           
           {nextMilestone ? (
               <div className="text-left md:text-right w-full md:w-auto bg-[#050505] md:bg-transparent p-3 md:p-0 rounded border border-[#222] md:border-none">
                  <p className="text-[10px] text-[#666] uppercase font-bold">PRÓXIMO MARCO</p>
                  <div className="flex items-center gap-2 justify-start md:justify-end">
                    <span className="text-lg md:text-xl font-bold text-[#FFD700]">{pointsNeeded} PTS Restantes</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#666" className="w-4 h-4 md:w-5 md:h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
               </div>
           ) : (
               <div className="text-left md:text-right">
                   <p className="text-[#FFD700] font-bold">MÁXIMO ATINGIDO</p>
                   <p className="text-xs text-[#666]">Você é a Lenda.</p>
               </div>
           )}
        </div>

        {/* Scrollable Timeline Area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 md:p-12 bg-[#080808] relative custom-scrollbar" ref={scrollContainerRef}>
           <div className="min-w-[800px] md:min-w-[1000px] h-full flex flex-col justify-center relative pt-12 min-h-[300px]">
              
              {/* Main Line Background */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-[#222] -translate-y-1/2 z-0 rounded-full"></div>
              
              {/* Progress Line */}
              <div 
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#E50914] to-[#FFD700] -translate-y-1/2 z-0 rounded-full transition-all duration-1000"
                style={{ width: `${visualPercentage}%` }}
              >
                  {/* Glowing Head of line */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FFD700] rounded-full blur-[4px]"></div>
              </div>

              {/* Nodes Container */}
              <div className="flex justify-between relative z-10 w-full px-4">
                  {MILESTONES.map((milestone, index) => {
                      const isUnlocked = currentPoints >= milestone.points;
                      const isNext = nextMilestone && nextMilestone.points === milestone.points;
                      
                      const isCurrentNode = index === currentSegmentIndex && !isNext && currentPoints < 10000;
                      const isMaxNode = currentPoints >= 10000 && index === MILESTONES.length - 1;

                      return (
                        <div key={index} className="flex flex-col items-center group relative">
                            
                            {/* "You are Here" Tooltip - CENTERED */}
                            {(isCurrentNode || isMaxNode) && (
                                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 animate-bounce bg-[#FFD700] text-black px-3 py-1 rounded text-xs font-bold uppercase tracking-wide after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#FFD700] whitespace-nowrap z-20 shadow-[0_0_10px_rgba(255,215,0,0.4)]">
                                    VOCÊ ESTÁ AQUI
                                </div>
                            )}

                            {/* Node Circle */}
                            <div className={`
                                w-8 h-8 md:w-12 md:h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 bg-[#0A0A0A] relative z-10
                                ${isUnlocked 
                                    ? 'border-[#E50914] shadow-[0_0_15px_rgba(229,9,20,0.5)] scale-110' 
                                    : 'border-[#333] grayscale opacity-50'
                                }
                                ${isNext ? 'border-[#FFD700] animate-pulse' : ''}
                            `}>
                                <div className={`w-2 h-2 md:w-4 md:h-4 rounded-full ${isUnlocked ? 'bg-[#E50914]' : 'bg-[#333]'}`}></div>
                            </div>

                            {/* Info Card Below */}
                            <div className="mt-6 w-24 md:w-40 text-center">
                                <div className={`
                                    border rounded-lg p-2 md:p-3 transition-all duration-300 min-h-[80px] md:min-h-[100px] flex flex-col items-center justify-center gap-2
                                    ${isUnlocked 
                                        ? 'bg-[#111] border-[#E50914]/30' 
                                        : 'bg-[#0A0A0A] border-[#222]'
                                    }
                                `}>
                                    {/* Icon */}
                                    {isUnlocked ? (
                                        <div className="w-6 h-6 md:w-8 md:h-8">
                                            <EagleBadge points={milestone.points} size="sm" />
                                        </div>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#444" className="w-5 h-5 md:w-6 md:h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                        </svg>
                                    )}

                                    <div>
                                        <p className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-1 ${isUnlocked ? 'text-white' : 'text-[#444]'}`}>
                                            {milestone.label}
                                        </p>
                                        <p className="hidden md:block text-[8px] text-[#555] font-mono leading-tight uppercase">
                                            {milestone.description}
                                        </p>
                                    </div>
                                </div>
                                
                                <p className={`mt-2 text-[8px] md:text-[10px] font-mono ${isUnlocked ? 'text-[#00FF00]' : 'text-[#333]'}`}>
                                    {isUnlocked ? '✅ CONQUISTADO' : `${milestone.points} pts`}
                                </p>
                            </div>

                            {/* Point Marker above line */}
                            <div className={`absolute -top-6 md:-top-8 text-[8px] md:text-[10px] font-mono font-bold ${isUnlocked ? 'text-[#E50914]' : 'text-[#333]'}`}>
                                {milestone.points} pts
                            </div>
                        </div>
                      );
                  })}
              </div>
           </div>
        </div>

        {/* Footer Quote */}
        <div className="p-3 md:p-4 bg-[#050505] border-t border-[#222] text-center shrink-0">
            <p className="text-[8px] md:text-[10px] text-[#444] font-mono font-bold uppercase tracking-widest">
                "A única direção é para frente."
            </p>
        </div>

      </div>
    </div>
  );
};

export default ProgressionModal;