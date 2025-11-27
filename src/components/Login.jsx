import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { User, Lock, ArrowRight, LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    identifier: '', password: '', name: '', email: '', phone: '', cpf: '', bike_number: ''
  });

  useEffect(() => {
    const userStorage = localStorage.getItem('user');
    if (userStorage) {
      const user = JSON.parse(userStorage);
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/login' : '/register';
    const url = `http://localhost:3000${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Erro ao processar");

      if (isLogin) {
        localStorage.setItem('user', JSON.stringify(data));
        
        if (data.role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/dashboard'); 
        }
      } else {
        setIsLogin(true);
        setError('');
        alert("Cadastro realizado! Faça login.");
        setFormData({ ...formData, password: '' });
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans text-white selection:bg-[#D80000] selection:text-white">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#111] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="p-8 text-center border-b border-gray-800 bg-gradient-to-b from-[#1a1a1a] to-[#111]">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Área do <span className="text-[#D80000]">Piloto</span></h2>
            <p className="text-gray-500 text-sm">{isLogin ? 'Acelere para dentro do sistema' : 'Crie sua conta'}</p>
          </div>
          <div className="p-8">
            {error && <div className="bg-red-900/20 border border-red-900 text-red-400 px-4 py-3 rounded mb-6 text-sm text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isLogin ? (
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Login</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-600" size={18} />
                    <input type="text" name="identifier" placeholder="Email, Nome ou Telefone" className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-200 focus:border-[#D80000] focus:outline-none" value={formData.identifier} onChange={handleChange} required />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Nome</label>
                    <input type="text" name="name" required className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg p-3 text-gray-200 focus:border-[#D80000] focus:outline-none" value={formData.name} onChange={handleChange} />
                  </div>
                  <input type="text" name="phone" placeholder="Telefone" className="w-full bg-[#0a0a0a] border-gray-700 rounded-lg p-3 mb-2" value={formData.phone} onChange={handleChange} required/>
                  <input type="text" name="bike_number" placeholder="Nº Moto" className="w-full bg-[#0a0a0a] border-gray-700 rounded-lg p-3 mb-2" value={formData.bike_number} onChange={handleChange} required/>
                  <input type="text" name="cpf" placeholder="CPF" className="w-full bg-[#0a0a0a] border-gray-700 rounded-lg p-3 mb-2" value={formData.cpf} onChange={handleChange} required/>
                  <input type="email" name="email" placeholder="Email" className="w-full bg-[#0a0a0a] border-gray-700 rounded-lg p-3 mb-2" value={formData.email} onChange={handleChange} required/>
                </>
              )}
              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-600" size={18} />
                  <input type="password" name="password" required placeholder="******" className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-200 focus:border-[#D80000] focus:outline-none" value={formData.password} onChange={handleChange} />
                </div>
                
                {/* CORREÇÃO AQUI: className em vez de class */}
                {isLogin && (
                    <div className="text-right mt-2">
                        <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-[#D80000] transition">Esqueceu a senha?</Link>
                    </div>
                )}

              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#D80000] hover:bg-red-700 text-white font-black uppercase py-4 rounded-lg tracking-widest shadow-lg hover:translate-y-[2px] transition-all flex items-center justify-center gap-2">
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
                {!loading && (isLogin ? <LogIn size={20} /> : <ArrowRight size={20} />)}
              </button>
            </form>
            <div className="mt-8 text-center pt-6 border-t border-gray-800">
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-white hover:text-[#D80000] font-bold uppercase text-sm tracking-wide transition-colors">
                {isLogin ? 'Criar Conta de Piloto' : 'Fazer Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;