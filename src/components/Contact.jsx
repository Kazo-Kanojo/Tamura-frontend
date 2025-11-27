import Navbar from "./Navbar";
import Footer from "./Footer";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#D80000] selection:text-white flex flex-col">
      <Navbar />

      {/* --- HERO SECTION (Cabeçalho) --- */}
      <div className="relative py-16 bg-[#0a0a0a] border-b border-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            Fale <span className="text-[#D80000]">Conosco</span>
          </h1>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">
            Dúvidas sobre inscrições, regulamento ou parcerias? Entre em contato com nossa equipe.
          </p>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* --- COLUNA 1: CANAIS DE ATENDIMENTO --- */}
          <div className="space-y-8">
            <h2 className="text-2xl font-black italic uppercase mb-6 text-[#D80000] border-l-4 border-[#D80000] pl-3">
              Canais Oficiais
            </h2>

            {/* WhatsApp */}
            <a 
              href="https://wa.me/5511947628294" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 flex items-center gap-6 hover:border-[#D80000] transition group cursor-pointer"
            >
              <div className="bg-[#D80000]/10 p-4 rounded-full group-hover:bg-[#D80000] transition">
                <Phone className="w-8 h-8 text-[#D80000] group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg uppercase italic">WhatsApp & Telefone</h3>
                <p className="text-gray-300 text-xl font-black mt-1">(11) 94762-8294</p>
                <span className="text-gray-500 text-sm">Clique para enviar mensagem</span>
              </div>
            </a>

            {/* E-mail */}
            <a 
              href="mailto:10tamura@gmail.com"
              className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 flex items-center gap-6 hover:border-[#D80000] transition group cursor-pointer"
            >
              <div className="bg-[#D80000]/10 p-4 rounded-full group-hover:bg-[#D80000] transition">
                <Mail className="w-8 h-8 text-[#D80000] group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg uppercase italic">E-mail</h3>
                <p className="text-gray-300 text-xl font-bold mt-1">10tamura@gmail.com</p>
                <span className="text-gray-500 text-sm">Clique para escrever</span>
              </div>
            </a>
          </div>

          {/* --- COLUNA 2: LOCALIZAÇÃO E REDES --- */}
          <div className="space-y-8">
            
            {/* Bloco de Endereço e Horário */}
            <div>
              <h2 className="text-2xl font-black italic uppercase mb-6 text-[#D80000] border-l-4 border-[#D80000] pl-3">
                Nosso QG
              </h2>
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 space-y-6">
                
                {/* Endereço */}
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-[#D80000] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold uppercase italic">Endereço</h3>
                    <p className="text-gray-300 mt-1">Rua Campos Salles, 662</p>
                    <p className="text-gray-300">Centro - Itatiba/SP</p>
                  </div>
                </div>

                <div className="border-t border-gray-800"></div>

                {/* Horário */}
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-[#D80000] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold uppercase italic">Horário de Atendimento</h3>
                    <p className="text-gray-300 mt-1">Segunda a Sexta</p>
                    <p className="text-gray-300 font-bold">08:00 às 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco de Redes Sociais */}
            <div>
              <h2 className="text-2xl font-black italic uppercase mb-6 text-[#D80000] border-l-4 border-[#D80000] pl-3">
                Siga a Tamura
              </h2>
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/tamuraeventos/?hl=pt-br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 hover:bg-[#D80000] transition flex-1 text-center group"
                >
                  <Instagram className="w-8 h-8 mx-auto text-gray-300 group-hover:text-white" />
                  <span className="block mt-2 font-bold text-gray-300 group-hover:text-white">Instagram</span>
                </a>
                
                <a 
                  href="https://www.facebook.com/tamuraeventos/?locale=pt_BR" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 hover:bg-[#D80000] transition flex-1 text-center group"
                >
                  <Facebook className="w-8 h-8 mx-auto text-gray-300 group-hover:text-white" />
                  <span className="block mt-2 font-bold text-gray-300 group-hover:text-white">Facebook</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;