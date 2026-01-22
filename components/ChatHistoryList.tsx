import React, { useEffect, useState } from 'react';
import { getStoredChats, deleteChatSession } from '../services/chatStorageService';
import { ChatSession } from '../types';

interface ChatHistoryListProps {
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ onSelectChat, onNewChat }) => {
  const [chats, setChats] = useState<ChatSession[]>([]);

  useEffect(() => {
    setChats(getStoredChats());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening the chat
    const confirmDelete = window.confirm("Tem certeza que deseja apagar este direcionamento? A ação é irreversível.");
    if (confirmDelete) {
        const updatedList = deleteChatSession(id);
        setChats(updatedList);
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
    <div className="flex flex-col h-full bg-[#0A0A0A] p-6 overflow-y-auto">
      <div className="flex justify-between items-center border-b border-[#9FB4C7]/20 pb-4 mb-6">
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
          Histórico de <span className="text-[#E50914]">Direcionamento</span>
        </h2>
        
        <button 
          onClick={onNewChat}
          className="bg-[#E50914] hover:bg-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-[0_0_15px_rgba(229,9,20,0.3)] hover:scale-110"
          title="Nova Sessão"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {chats.length === 0 ? (
        <div className="text-center mt-20 text-[#9FB4C7] opacity-50 flex flex-col items-center">
            <p className="text-6xl mb-4">📜</p>
            <p>Nenhum registro encontrado.</p>
            <p className="text-sm mt-2">Inicie uma nova sessão para começar a evoluir.</p>
            <button 
              onClick={onNewChat}
              className="mt-6 border border-[#E50914] text-[#E50914] px-6 py-2 rounded uppercase font-bold text-xs hover:bg-[#E50914] hover:text-white transition-all"
            >
              Iniciar Agora
            </button>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className="w-full text-left bg-[#0F0F0F] border border-[#9FB4C7]/10 hover:border-[#E50914] p-4 rounded-lg group transition-all duration-300 relative overflow-hidden cursor-pointer"
            >
              <div className="flex justify-between items-start mb-1 pr-8">
                <h3 className="text-white font-bold group-hover:text-[#E50914] truncate pr-4 text-sm md:text-base relative z-10">
                  {chat.title}
                </h3>
                <span className="text-[10px] text-[#9FB4C7] font-mono whitespace-nowrap relative z-10">
                  {formatDate(chat.lastModified)}
                </span>
              </div>
              <p className="text-[#9FB4C7] text-xs truncate opacity-60 font-mono relative z-10 pr-8">
                {chat.preview}
              </p>

              {/* Delete Button - Golden Trash Can */}
              <button
                onClick={(e) => handleDelete(e, chat.id)}
                className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                title="Apagar Direcionamento"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FFD700" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistoryList;
