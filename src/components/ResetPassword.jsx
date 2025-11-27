import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Key, Lock, CheckCircle, AlertCircle, Save } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ token: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ text: 'As senhas não coincidem.', type: 'error' });
        return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:3000/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: formData.token, newPassword: formData.newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Senha alterada com sucesso! Redirecionando...', type: 'success' });
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage({ text: data.error || 'Erro ao redefinir.', type: 'error' });
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
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Nova <span className="text-[#D80000]">Senha</span></h2>
            <p className="text-gray-500 text-sm">Insira o token recebido e sua nova senha.</p>
          </div>
          
          <div className="p-8">
            {message.text && (
              <div className={`px-4 py-3 rounded mb-6 text-sm text-center flex items-center justify-center gap-2 ${message.type === 'success' ? 'bg-green-900/20 border border-green-900 text-green-400' : 'bg-red-900/20 border border-red-900 text-red-400'}`}>
                {message.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Token de Recuperação</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-gray-600" size={18} />
                  <input 
                    type="text" 
                    required 
                    placeholder="Cole o código aqui" 
                    className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-yellow-500 font-mono font-bold focus:border-[#D80000] focus:outline-none transition" 
                    value={formData.token} 
                    onChange={(e) => setFormData({...formData, token: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-600" size={18} />
                  <input type="password" required placeholder="******" className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-200 focus:border-[#D80000] focus:outline-none transition" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Confirmar Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-600" size={18} />
                  <input type="password" required placeholder="******" className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-200 focus:border-[#D80000] focus:outline-none transition" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#D80000] hover:bg-red-700 text-white font-black uppercase py-4 rounded-lg tracking-widest shadow-lg hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Salvando...' : 'Salvar Nova Senha'}
                {!loading && <Save size={20} />}
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-gray-800">
                <Link to="/login" className="text-gray-500 hover:text-white text-xs underline">Cancelar e Voltar</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;