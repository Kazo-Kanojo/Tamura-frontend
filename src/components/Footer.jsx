import { Facebook, Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#050505] text-white border-t border-[#D80000] pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Coluna 1: Sobre */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#D80000] rounded flex items-center justify-center font-black italic">T</div>
              <h2 className="text-2xl font-black italic uppercase">Tamura <span className="text-[#D80000]">Eventos</span></h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Organizando as melhores competições de Velocross desde 2010. 
              Pistas desafiadoras, estrutura completa e adrenalina garantida para pilotos e público.
            </p>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-4 border-l-4 border-[#D80000] pl-3">Acesso Rápido</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="hover:text-white cursor-pointer transition">Calendário 2025</li>
              <li className="hover:text-white cursor-pointer transition">Regulamento Oficial</li>
            </ul>
          </div>

          {/* Coluna 3: Contato */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-4 border-l-4 border-[#D80000] pl-3">Fale Conosco</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#D80000]" />
                (11) 94762-8294 
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#D80000]" />
                10tamura@gmail.com
              </li>
              <li className="flex items-center gap-4 mt-4">
                <a href="https://www.instagram.com/tamuraeventos/?hl=pt-br" className="bg-[#1a1a1a] p-2 rounded hover:bg-[#D80000] transition text-white">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.facebook.com/tamuraeventos/?locale=pt_BR" className="bg-[#1a1a1a] p-2 rounded hover:bg-[#D80000] transition text-white">
                  <Facebook className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Linha Final */}
        <div className="border-t border-gray-900 pt-8 text-center text-gray-600 text-xs uppercase tracking-wider">
          <p>&copy; 2025 Tamura Eventos. Todos os direitos reservados.</p>
          <p className="mt-2">Desenvolvido com 🏁 Adrenalina e Código</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;