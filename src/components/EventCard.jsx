import React from 'react';
import { Calendar, MapPin, ExternalLink, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../api';

const EventCard = ({ stage, statusBadge, children }) => {
  if (!stage) return null;

  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-red-900/20 transition-all group flex flex-col h-full hover:border-[#D80000]">
      {/* Imagem */}
      <div className="h-48 overflow-hidden relative bg-neutral-900">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all z-10" />
        {stage.image_url ? (
            <img 
            src={stage.image_url.startsWith('http') ? stage.image_url : `${API_URL}${stage.image_url}`} 
            alt={stage.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
        ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-gray-700 font-bold">
                SEM IMAGEM
            </div>
        )}
        
        {/* Badge do Topo (Data ou Status) */}
        <div className="absolute top-3 right-3 z-20">
            {statusBadge ? (
                // Se o Dashboard mandou um status, mostra ele
                statusBadge
            ) : (
                // Padrão (Home): Mostra a Data
                <span className="bg-neutral-900/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-red-500/50 shadow-xl text-red-500 font-bold text-sm block">
                    {new Date(stage.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
                </span>
            )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-black italic uppercase text-white mb-2 line-clamp-1 group-hover:text-[#D80000] transition-colors">
            {stage.name}
        </h3>
        
        <div className="space-y-3 mb-6 flex-grow">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Calendar size={16} className="text-[#D80000]" />
                <span>Início: {new Date(stage.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin size={16} className="text-[#D80000]" />
                <span className="line-clamp-1">{stage.location}</span>
            </div>

            {/* --- MAPA EMBED (Com o nome do local) --- */}
            {stage.location && (
                <div className="w-full h-32 mt-2 rounded-lg overflow-hidden border border-gray-700 relative bg-neutral-900 group/map">
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                        title="Mapa da Etapa"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(stage.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        className="filter grayscale opacity-80 group-hover/map:grayscale-0 group-hover/map:opacity-100 transition-all duration-500 pointer-events-none"
                    ></iframe>
                    
                    {/* Botão de GPS flutuante */}
                    {stage.map_link && (
                        <a 
                            href={stage.map_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()} 
                            className="absolute bottom-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-500 transition shadow-lg pointer-events-auto z-30"
                        >
                            <Navigation size={10} /> Abrir GPS
                        </a>
                    )}
                </div>
            )}
        </div>

        {/* Botões de Ação (Flexibilidade para Home vs Dashboard) */}
        <div className="mt-auto">
            {children ? (
                // Se o componente pai passar botões (Dashboard), renderiza eles
                children
            ) : (
                // Se não (Home), renderiza o padrão
                <div className="w-full py-3 rounded bg-[#D80000] text-white font-black uppercase tracking-widest text-center text-sm shadow-lg group-hover:bg-red-700 transition-colors">
                    Inscrever-se
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;