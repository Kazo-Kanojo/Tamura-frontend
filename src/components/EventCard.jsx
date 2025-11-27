import React from 'react';

const EventCard = ({ title, date, location, price, image }) => {
  return (
    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-800 hover:border-[#D80000] group">
      
      {/* 1. Imagem do Evento */}
      <div className="relative h-48 overflow-hidden">
        {/* CORREÇÃO: Usa a prop 'image' dinâmica em vez do caminho fixo */}
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        {/* Etiqueta de Preço flutuante */}
        {/* CORREÇÃO: Removeu o 'R$' fixo para aceitar textos como 'Inscrições Abertas' */}
        <div className="absolute top-0 right-0 bg-[#D80000] text-white font-bold px-3 py-1 rounded-bl-lg">
          {price}
        </div>
      </div>

      {/* 2. Informações */}
      <div className="p-5 text-white">
        <h3 className="text-xl font-bold uppercase italic mb-2 group-hover:text-[#D80000] transition">
          {title}
        </h3>
        
        <div className="text-gray-400 text-sm space-y-1 mb-4">
          <p className="flex items-center gap-2">
            📅 {date}
          </p>
          <p className="flex items-center gap-2">
            📍 {location}
          </p>
        </div>

        {/* 3. Botão de Inscrição */}
        <button className="w-full bg-[#D80000] hover:bg-red-700 text-white font-bold py-2 rounded uppercase text-sm tracking-widest transition shadow-[0_4px_0_rgb(150,0,0)] hover:shadow-[0_2px_0_rgb(150,0,0)] active:shadow-none active:translate-y-1">
          Garantir Vaga
        </button>
      </div>
    </div>
  );
};

export default EventCard;