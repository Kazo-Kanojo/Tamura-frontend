import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:3000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'E-mail enviado! Verifique sua caixa de entrada (e spam) para pegar o token.', type: 'success' });
      } else {
        setMessage({ text: data.error || 'Erro ao enviar e-mail.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Erro de conexão com o servidor.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans text-white selection:bg-[#D80000] selection:text-white">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#111] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center border-b border-gray-800 bg-gradient-to-b from-[#1a1a1a] to-[#111]">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Recuperar <span className="text-[#D80000]">Senha</span></h2>
            <p className="text-gray-500 text-sm">Digite seu e-mail para receber um token de recuperação.</p>
          </div>
          
          <div className="p-8">
            {message.text && (
              <div className={`px-4 py-3 rounded mb-6 text-sm text-center flex items-center justify-center gap-2 ${message.type === 'success' ? 'bg-green-900/20 border border-green-900 text-green-400' : 'bg-red-900/20 border border-red-900 text-red-400'}`}>
                {message.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Seu E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-600" size={18} />
                  <input 
                    type="email" 
                    required 
                    placeholder="exemplo@email.com" 
                    className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-200 focus:border-[#D80000] focus:outline-none transition" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#D80000] hover:bg-red-700 text-white font-black uppercase py-4 rounded-lg tracking-widest shadow-lg hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Enviando...' : 'Enviar Token'}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-gray-800">
              <Link to="/reset-password">
                <button className="text-white hover:text-[#D80000] font-bold uppercase text-xs tracking-wide transition-colors">
                  Já tenho o token? Redefinir Senha
                </button>
              </Link>
              <div className="mt-4">
                <Link to="/login" className="text-gray-500 hover:text-white text-xs underline">Voltar para Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;