import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import EventCard from "./EventCard";
import Footer from "./Footer";
import { Timer, Award, Users, CheckCircle, Phone, Mail, MapPin } from "lucide-react";

const Home = () => {
  const [events, setEvents] = useState([]);

  // Busca os eventos reais do Backend
  useEffect(() => {
    fetch('http://localhost:3000/api/stages') 
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("Erro ao buscar eventos:", err));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#D80000] selection:text-white flex flex-col">
      <Navbar />

      {/* =========================================
          SEÇÃO 1: HERO (BANNER PRINCIPAL)
         ========================================= */}
      <div className="relative bg-[#0a0a0a] border-b-4 border-[#D80000] overflow-hidden h-[600px] flex items-center">
        <div className="absolute inset-0 z-0 opacity-40">
           {/* CORREÇÃO: Caminho absoluto para a pasta public */}
           <img 
            src="/bgLandPage.jpeg" 
            className="w-full h-full object-cover grayscale" 
            alt="Fundo Motocross"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop"; }} // Fallback se a imagem não existir
           />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/80"></div>
        
        <div className="relative z-20 container mx-auto px-4 text-center mt-10">
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6 drop-shadow-lg animate-fade-in-up">
            Acelere para a <span className="text-[#D80000]">Glória</span>
          </h2>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium shadow-black drop-shadow-md animate-fade-in-up delay-100">
            O sistema oficial de inscrições da Tamura Eventos. 
            Garanta seu gate nas melhores pistas de Velocross da região.
          </p>
          
          <Link to="/login">
            <button className="bg-[#D80000] hover:bg-red-700 text-white px-8 py-4 rounded font-black uppercase text-lg tracking-widest transition-transform hover:-translate-y-1 shadow-[0_4px_0_rgb(100,0,0)] hover:shadow-[0_2px_0_rgb(100,0,0)] active:shadow-none active:translate-y-0 animate-bounce-slow">
              Quero Correr
            </button>
          </Link>
        </div>
      </div>

      {/* =========================================
          SEÇÃO 2: PRÓXIMAS ETAPAS
         ========================================= */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-2 h-10 bg-[#D80000]"></div>
          <h3 className="text-3xl font-black text-white uppercase italic tracking-wide">
            Próximas <span className="text-[#D80000]">Etapas</span>
          </h3>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Link to={`/event/${event.id}/register`} key={event.id} className="block group">
                <EventCard 
                  title={event.name}
                  // Formata a data para ficar mais amigável
                  date={new Date(event.date).toLocaleDateString('pt-BR')} 
                  location={event.location}
                  price="Inscrições Abertas" 
                  // MELHORIA: Usa a imagem cadastrada no Admin ou uma padrão
                  image={event.image_url ? `http://localhost:3000${event.image_url}` : "/bgEvent.jpg"} 
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#1a1a1a] rounded border border-gray-800">
            <p className="text-gray-500 text-xl italic">Aguardando divulgação das próximas etapas...</p>
          </div>
        )}
      </div>

      {/* =========================================
          SEÇÃO 3: SOBRE A TAMURA
         ========================================= */}
      <div id="sobre" className="py-20 bg-[#0a0a0a] border-t border-gray-900">
        <div className="container mx-auto px-4">
          {/* Título da Seção */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">
              Sobre a <span className="text-[#D80000]">Tamura Eventos</span>
            </h2>
            <div className="w-24 h-1 bg-[#D80000] mx-auto mt-4"></div>
          </div>

          {/* História e Missão */}
          <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
            <div className="w-full md:w-1/2 relative group">
              <div className="absolute -inset-2 bg-[#D80000] rounded-lg opacity-20 group-hover:opacity-40 transition duration-500 blur-lg"></div>
              <img 
                src="/imagemLargada.jpg" 
                alt="Largada Velocross" 
                className="relative rounded-lg shadow-2xl w-full object-cover border border-gray-800 h-80"
              />
            </div>

            <div className="w-full md:w-1/2 space-y-8">
              <div>
                <h3 className="text-2xl font-black italic uppercase mb-2 flex items-center gap-2 text-gray-100">
                  <Award className="text-[#D80000]" /> Nossa História
                </h3>
                <p className="text-gray-400 leading-relaxed border-l-2 border-[#D80000] pl-4">
                  Desde 2010, a Tamura Eventos organiza as melhores competições de Velocross da região. 
                  Começamos com a paixão por duas rodas e hoje somos referência em organização, segurança e adrenalina.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-black italic uppercase mb-2 flex items-center gap-2 text-gray-100">
                  <Users className="text-[#D80000]" /> Nossa Missão
                </h3>
                <p className="text-gray-400 leading-relaxed border-l-2 border-[#D80000] pl-4">
                  Proporcionar experiências inesquecíveis para pilotos e público, elevando o nível do esporte 
                  com cronometragem precisa e pistas desafiadoras.
                </p>
              </div>
            </div>
          </div>

          {/* Cronometragem (Destaque) */}
          <div className="bg-[#1a1a1a] rounded-2xl p-10 border border-gray-800 relative overflow-hidden">
             <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
                <Timer size={300} />
             </div>
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <h3 className="text-3xl font-black italic uppercase text-white mb-2">
                        Cronometragem <span className="text-[#D80000]">Digital</span>
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-xl">
                        Tecnologia de ponta com chips de alta precisão. Resultados em tempo real para que nenhum centésimo seja perdido.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                        <span className="flex items-center gap-1"><CheckCircle size={16} className="text-[#D80000]"/> Transponders Ativos</span>
                        <span className="flex items-center gap-1"><CheckCircle size={16} className="text-[#D80000]"/> Live Timing</span>
                        <span className="flex items-center gap-1"><CheckCircle size={16} className="text-[#D80000]"/> Relatórios PDF</span>
                    </div>
                </div>
                <Link to="/login">
                    <button className="border border-[#D80000] text-[#D80000] hover:bg-[#D80000] hover:text-white px-6 py-3 rounded uppercase font-bold transition">
                        Saiba Mais
                    </button>
                </Link>
             </div>
          </div>
        </div>
      </div>

      {/* =========================================
          SEÇÃO 4: CONTATO
         ========================================= */}
      <div id="contato" className="py-20 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                Fale <span className="text-[#D80000]">Conosco</span>
                </h2>
                <p className="text-gray-500 mt-2">Dúvidas? Nossa equipe está pronta para ajudar.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Card 1: WhatsApp */}
                <a href="https://wa.me/5511947628294" target="_blank" rel="noreferrer" className="bg-[#111] p-8 rounded-xl border border-gray-800 hover:border-[#D80000] group transition text-center flex flex-col items-center">
                    <div className="bg-[#D80000]/10 p-4 rounded-full mb-4 group-hover:bg-[#D80000] transition">
                        <Phone className="w-8 h-8 text-[#D80000] group-hover:text-white" />
                    </div>
                    <h3 className="font-bold text-lg uppercase italic text-white">WhatsApp</h3>
                    <p className="text-gray-400 mt-2">(11) 94762-8294</p>
                </a>

                {/* Card 2: Email */}
                <a href="mailto:10tamura@gmail.com" className="bg-[#111] p-8 rounded-xl border border-gray-800 hover:border-[#D80000] group transition text-center flex flex-col items-center">
                    <div className="bg-[#D80000]/10 p-4 rounded-full mb-4 group-hover:bg-[#D80000] transition">
                        <Mail className="w-8 h-8 text-[#D80000] group-hover:text-white" />
                    </div>
                    <h3 className="font-bold text-lg uppercase italic text-white">E-mail</h3>
                    <p className="text-gray-400 mt-2">10tamura@gmail.com</p>
                </a>

                {/* Card 3: Localização */}
                <div className="bg-[#111] p-8 rounded-xl border border-gray-800 hover:border-[#D80000] group transition text-center flex flex-col items-center">
                    <div className="bg-[#D80000]/10 p-4 rounded-full mb-4 group-hover:bg-[#D80000] transition">
                        <MapPin className="w-8 h-8 text-[#D80000] group-hover:text-white" />
                    </div>
                    <h3 className="font-bold text-lg uppercase italic text-white">Onde Estamos</h3>
                    <p className="text-gray-400 mt-2">Itatiba - SP</p>
                </div>

            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;