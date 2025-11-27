import Navbar from "./Navbar";
import Footer from "./Footer";
import { Timer, Award, Users, CheckCircle } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#D80000] selection:text-white flex flex-col">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="relative py-20 bg-[#0a0a0a] border-b border-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
            Sobre a <span className="text-[#D80000]">Tamura Eventos</span>
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Paixão, adrenalina e precisão em cada etapa. Conheça quem faz o Velocross acontecer.
          </p>
        </div>
      </div>

      {/* --- BLOCO 1: HISTÓRIA E MISSÃO --- */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center gap-12">
          
          {/* Imagem (Largada) */}
          <div className="w-full md:w-1/2 relative group">
            <div className="absolute -inset-2 bg-[#D80000] rounded-lg opacity-20 group-hover:opacity-40 transition duration-500 blur-lg"></div>
            {/* Certifique-se que imagemLargada.jpg está na pasta public */}
            <img 
              src="/imagemLargada.jpg" 
              alt="Largada de Velocross Categoria Base" 
              className="relative rounded-lg shadow-2xl w-full object-cover border border-gray-800"
            />
          </div>

          {/* Texto */}
          <div className="w-full md:w-1/2 space-y-8">
            <div>
              <h2 className="text-3xl font-black italic uppercase mb-4 flex items-center gap-2">
                <Award className="text-[#D80000]" /> Nossa História
              </h2>
              <p className="text-gray-300 leading-relaxed bg-[#1a1a1a] p-6 rounded-lg border-l-4 border-[#D80000]">
                (Adicionar história para mostrar pro cliente e depois faço a devida alteração. 
                Aqui contaremos como a Tamura Eventos começou e se consolidou no mercado.)
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-black italic uppercase mb-4 flex items-center gap-2">
                <Users className="text-[#D80000]" /> Nossa Missão
              </h2>
              <p className="text-gray-300 leading-relaxed bg-[#1a1a1a] p-6 rounded-lg border-l-4 border-[#D80000]">
                (Adicionar missão para mostrar pro cliente. Foco no desenvolvimento do esporte, 
                segurança dos pilotos e qualidade técnica das pistas.)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- BLOCO 2: CRONOMETRAGEM --- */}
      <div className="bg-[#1a1a1a] border-y border-[#D80000] py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5">
            <Timer size={400} />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="md:w-2/3">
                <h2 className="text-4xl font-black italic uppercase mb-4 text-white">
                    Cronometragem <span className="text-[#D80000]">Esportiva</span>
                </h2>
                <p className="text-xl text-gray-300 mb-6 font-light">
                    Realizamos serviços de cronometragem digital com chips no seu evento. Precisão de milésimos de segundo para garantir o resultado justo.
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle className="text-[#D80000] w-4 h-4"/> Resultados em tempo real</li>
                    <li className="flex items-center gap-2"><CheckCircle className="text-[#D80000] w-4 h-4"/> Chips de alta precisão</li>
                    <li className="flex items-center gap-2"><CheckCircle className="text-[#D80000] w-4 h-4"/> Relatórios completos pós-prova</li>
                    <li className="flex items-center gap-2"><CheckCircle className="text-[#D80000] w-4 h-4"/> Equipe técnica especializada</li>
                </ul>
            </div>
            
            <div className="md:w-1/3">
                <button className="bg-[#D80000] hover:bg-red-700 text-white px-8 py-4 rounded font-black uppercase text-lg tracking-widest transition-transform hover:-translate-y-1 shadow-[0_4px_0_rgb(100,0,0)] hover:shadow-[0_2px_0_rgb(100,0,0)] w-full">
                    Consulte-nos
                </button>
            </div>
        </div>
      </div>

      {/* --- BLOCO 3: QUEM ORGANIZA (Tamura) --- */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-black italic uppercase">Liderança & <span className="text-[#D80000]">Organização</span></h2>
        </div>

        <div className="flex flex-col items-center">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#D80000] to-gray-900 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-500"></div>
                {/* AQUI ESTÁ A CORREÇÃO DA IMAGEM */}
                <img 
                    src="/tamuraChefe.png" 
                    alt="Tamura e Equipe" 
                    className="relative w-64 h-64 md:w-80 md:h-80 object-cover rounded-full border-4 border-[#1a1a1a] shadow-2xl"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "https://via.placeholder.com/300?text=Foto+Tamura"; // Fallback se der erro
                      console.log("Erro ao carregar imagem tamuraChefe.jpg. Verifique a pasta public.");
                    }}
                />
            </div>
            
            <div className="text-center mt-8 max-w-2xl">
                <h3 className="text-2xl font-bold text-white uppercase italic">Tamura</h3>
                <p className="text-[#D80000] font-bold text-sm tracking-widest mb-4">ORGANIZADOR OFICIAL</p>
                <p className="text-gray-400">
                    À frente da organização, Tamura traz anos de experiência e dedicação ao motociclismo, sempre trabalhando em equipe para entregar eventos impecáveis.
                </p>
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;