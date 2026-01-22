import React, { useState, useEffect } from 'react';
import { generateMindMapText } from '../services/geminiService';
import { addPoints } from '../services/gamificationService';
import { saveMindMap, getStoredMindMaps, deleteMindMap, StoredMindMap } from '../services/mindMapStorageService';

const MindMapGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [generatedMap, setGeneratedMap] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<StoredMindMap[]>([]);

  // Load history on mount
  useEffect(() => {
    setHistory(getStoredMindMaps());
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setGeneratedMap(null);
    
    try {
      const result = await generateMindMapText(topic);
      if (result) {
        setGeneratedMap(result);
        addPoints(20); // Award points for structuring
        
        // Save to history
        saveMindMap(topic, result);
        // Refresh history list
        setHistory(getStoredMindMaps());
      } else {
        alert("O sistema está sobrecarregado. Tente novamente.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedMap) {
      navigator.clipboard.writeText(generatedMap);
      alert("Mapa copiado para a área de transferência.");
    }
  };

  const loadFromHistory = (item: StoredMindMap) => {
      setTopic(item.topic);
      setGeneratedMap(item.content);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(confirm('Apagar este registro permanentemente?')) {
          const updated = deleteMindMap(id);
          setHistory(updated);
      }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col items-center h-full p-4 md:p-6 bg-[#0A0A0A] overflow-y-auto w-full">
      <div className="max-w-4xl w-full pb-20">
        <h2 className="text-xl md:text-2xl font-bold text-[#FFD700] mb-2 font-mono uppercase tracking-wider">
          Módulo de Clareza Estrutural
        </h2>
        <p className="text-[#9FB4C7] mb-8 text-sm md:text-base">
          A confusão mental mata a execução. Descreva o caos da sua mente, e o sistema criará um mapa de batalha lógico.
        </p>

        <div className="bg-[#0F0F0F] border border-[#9FB4C7]/20 p-4 md:p-6 rounded-xl mb-8">
          <label className="block text-sm font-bold text-gray-300 mb-2">
            ONDE ESTÁ A CONFUSÃO?
          </label>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Não sei se começo academia, dropshipping ou estudo inglês..."
              className="flex-1 bg-[#151515] border border-[#9FB4C7]/30 rounded-lg p-3 text-white focus:outline-none focus:border-[#E50914] placeholder-[#9FB4C7]/40 font-mono text-sm w-full"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-[#E50914] text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50 uppercase tracking-wide text-xs md:text-sm w-full md:w-auto"
            >
              {loading ? 'ESTRUTURANDO...' : 'GERAR MAPA'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 border border-[#333] border-dashed rounded-xl mb-8">
            <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#9FB4C7] font-mono text-xs uppercase animate-pulse">
              Conectando aos nós de processamento...
            </p>
          </div>
        )}

        {generatedMap && (
          <div className="animate-fade-in border border-[#9FB4C7]/30 rounded-lg overflow-hidden shadow-2xl bg-[#050505] relative group mb-12">
            
            {/* Toolbar */}
            <div className="bg-[#111] p-3 flex justify-between items-center border-b border-[#333]">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#E50914]"></div>
                 <span className="text-xs text-[#9FB4C7] font-mono uppercase tracking-widest">MAPA_ESTRUTURAL_TXT</span>
              </div>
              <button 
                onClick={handleCopy}
                className="text-xs text-[#FFD700] hover:text-white font-mono uppercase border border-[#FFD700]/30 hover:border-[#FFD700] px-3 py-1 rounded transition-all"
              >
                COPIAR ESTRUTURA
              </button>
            </div>

            {/* Content */}
            <div className="p-4 md:p-8 overflow-x-auto w-full">
               <pre className="font-mono text-xs md:text-sm text-[#E5E5E5] leading-relaxed whitespace-pre-wrap md:whitespace-pre-wrap min-w-max md:min-w-0 selection:bg-[#E50914] selection:text-white">
                 {generatedMap}
               </pre>
            </div>
            
            {/* Decorative Matrix lines */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(255,0,0,0.02),rgba(255,0,0,0.06))] z-0 background-size-[100%_2px,3px_100%]"></div>
          </div>
        )}

        {/* --- HISTORY SECTION --- */}
        <div className="mt-12 border-t border-[#333] pt-8">
            <div className="flex items-center gap-2 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#E50914" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <h3 className="text-white font-black uppercase tracking-wider text-sm">Histórico de Estruturas</h3>
            </div>

            {history.length === 0 ? (
                <p className="text-[#444] text-xs font-mono">Nenhum mapa gravado ainda. Gere sua primeira estrutura.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => loadFromHistory(item)}
                            className="bg-[#0F0F0F] border border-[#222] p-4 rounded-lg cursor-pointer hover:border-[#E50914] hover:bg-[#151515] transition-all group relative"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-white font-bold text-sm truncate pr-6 max-w-[80%]">{item.topic}</h4>
                                <span className="text-[10px] text-[#666] font-mono">{formatDate(item.timestamp)}</span>
                            </div>
                            <div className="text-[10px] text-[#666] font-mono overflow-hidden h-8 leading-tight opacity-70">
                                {item.content.substring(0, 80)}...
                            </div>
                            
                            {/* Delete Button */}
                            <button 
                                onClick={(e) => handleDelete(e, item.id)}
                                className="absolute top-2 right-2 text-[#333] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                title="Apagar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MindMapGenerator;