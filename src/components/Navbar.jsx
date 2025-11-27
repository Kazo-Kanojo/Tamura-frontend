import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoTamura from '../assets/logoTamura.png';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  // Se tiver usuário, a logo leva pro Dashboard. Se não, leva pra Home.
  const homeLink = user ? "/dashboard" : "/";

  return (
    <nav className="bg-[#0a0a0a] text-white shadow-xl border-b-2 border-[#D80000] sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-4">
        
        {/* LOGO INTELIGENTE */}
        <Link to={homeLink} className="flex items-center gap-3 group cursor-pointer flex-shrink-0">
          <img 
            src={logoTamura} 
            alt="Tamura Eventos Logo" 
            className="h-12 w-auto object-contain hover:scale-105 transition duration-300" 
          />
          <h1 className="text-2xl font-black italic tracking-tighter uppercase hidden lg:block">
            Tamura <span className="text-[#D80000]">Eventos</span>
          </h1>
        </Link>

        {/* MENU PÚBLICO (SÓ APARECE SE NÃO TIVER LOGADO) */}
        {!user && (
          <ul className="hidden md:flex gap-6 font-bold text-sm tracking-wide uppercase whitespace-nowrap">
            <Link to="/"><li className="hover:text-[#D80000] cursor-pointer transition">Calendário</li></Link>
            <a href="#sobre"><li className="hover:text-[#D80000] cursor-pointer transition">Sobre Nós</li></a>
            <a href="#contato"><li className="hover:text-[#D80000] cursor-pointer transition">Contato</li></a>
          </ul>
        )}

        {/* ÁREA DO USUÁRIO */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-6">
              <span className="hidden md:flex items-center gap-2 font-bold text-sm text-gray-300">
                <User size={16} className="text-[#D80000]"/> {user.name}
              </span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 border border-gray-700 hover:border-red-600 hover:text-red-500 px-4 py-2 rounded transition text-xs font-bold uppercase tracking-widest"
              >
                <LogOut size={14} /> Sair
              </button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <button className="hidden md:block font-bold text-sm hover:text-[#D80000] transition">LOGIN</button>
              </Link>
              <Link to="/login"> 
                <button className="bg-[#D80000] hover:bg-red-700 text-white px-6 py-2 rounded font-black uppercase text-xs tracking-wider transition-transform hover:-translate-y-1 shadow-[0_4px_0_rgb(150,0,0)]">
                  CADASTRAR
                </button>
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;