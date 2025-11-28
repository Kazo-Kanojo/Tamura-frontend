import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Standings from "./Standings"; 
import { Calendar, MapPin, PlusCircle, CheckCircle, Trophy, Flag, Cpu, Clock, AlertCircle, Tag, Copy } from "lucide-react";
import API_URL from "../api";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stages, setStages] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [batchName, setBatchName] = useState(''); 
  const [pixKey, setPixKey] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchData(parsedUser.id, parsedUser.token); // MANDA O TOKEN
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // HELPER DE AUTH
  const getAuthHeaders = (token) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
  });

  const fetchData = async (userId, token) => {
    setLoading(true);
    try {
      // 1. Busca Usuário (Agora Protegido)
      const userRes = await fetch(`${API_URL}/api/users/${userId}`, {
          headers: getAuthHeaders(token)
      });
      
      if (userRes.ok) {
          const updatedUser = await userRes.json();
          setUser(prev => ({ ...prev, ...updatedUser })); 
          const currentStorage = JSON.parse(localStorage.getItem('user'));
          // Mantém o token no storage ao atualizar os dados
          localStorage.setItem('user', JSON.stringify({ ...currentStorage, ...updatedUser }));
      } else if (userRes.status === 403 || userRes.status === 401) {
          navigate("/login"); // Token invalido/vencido
          return;
      }

      // 2. Busca Etapas (Público)
      const stagesRes = await fetch(`${API_URL}/api/stages`);
      setStages(await stagesRes.json());

      // 3. Busca Inscrições (Agora Protegido)
      const myRegRes = await fetch(`${API_URL}/api/registrations/user/${userId}`, {
          headers: getAuthHeaders(token)
      });
      setMyRegistrations(await myRegRes.json());

      // 4. Configurações (Público)
      const batchRes = await fetch(`${API_URL}/api/settings/current_batch`);
      const batchData = await batchRes.json();
      setBatchName(batchData.value || '');

      const pixRes = await fetch(`${API_URL}/api/settings/pix_key`);
      const pixData = await pixRes.json();
      setPixKey(pixData.value || '');

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
      navigator.clipboard.writeText(pixKey);
      alert("Chave PIX copiada!");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      
      <Navbar />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-12">
          
          {/* CABEÇALHO */}
          <div className="mb-16 flex flex-col md:flex-row justify-between items-end border-b border-gray-800 pb-8 gap-6">
            <div>
              <span className="text-[#D80000] font-bold tracking-widest text-sm uppercase mb-2 block">Área do Piloto</span>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                Olá, <span className="text-white">{user.name.split(' ')[0]}</span>
              </h1>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
                <div className="bg-[#111] px-6 py-4 rounded-xl border border-gray-800 flex items-center gap-4 flex-1 md:flex-none">
                    <div className="bg-[#D80000] w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(216,0,0,0.4)]">
                        <span className="font-black text-black text-lg">#</span>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Moto Nº</p>
                        <p className="text-2xl font-black italic">{user.bike_number || "00"}</p>
                    </div>
                </div>

                <div className="bg-[#111] px-6 py-4 rounded-xl border border-gray-800 flex items-center gap-4 flex-1 md:flex-none">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${user.chip_id ? 'bg-blue-900/20 border-blue-500 text-blue-500' : 'bg-gray-800 border-gray-700 text-gray-600'}`}>
                        <Cpu size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Transponder</p>
                        <p className={`text-xl font-black italic ${user.chip_id ? 'text-blue-400' : 'text-gray-600'}`}>
                            {user.chip_id || "---"}
                        </p>
                    </div>
                </div>
            </div>
          </div>

          {/* SEÇÃO DE ETAPAS */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <Flag size={32} className="text-[#D80000]" />
                    <h2 className="text-3xl font-black uppercase italic">Minhas <span className="text-[#D80000]">Etapas</span></h2>
                </div>
                {batchName && (
                    <div className="hidden md:flex items-center gap-2 bg-yellow-900/20 border border-yellow-600/50 px-4 py-2 rounded-full">
                        <Tag size={16} className="text-yellow-500"/>
                        <span className="text-yellow-500 font-bold text-sm uppercase tracking-wider">{batchName}</span>
                    </div>
                )}
            </div>

            {stages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stages.map((stage) => {
                  const registration = myRegistrations.find(r => r.stage_id === stage.id);
                  const isRegistered = !!registration;
                  const isPaid = registration?.status === 'paid';

                  return (
                    <div key={stage.id} className={`bg-[#111] border rounded-2xl overflow-hidden transition-all duration-300 group shadow-lg flex flex-col ${isRegistered ? (isPaid ? 'border-green-900/50' : 'border-yellow-900/50') : 'border-gray-800 hover:border-[#D80000]'}`}>
                      <div className="h-48 bg-neutral-900 relative overflow-hidden">
                          {stage.image_url ? (
                              <img src={`${API_URL}${stage.image_url}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-700"/>
                          ) : (
                              <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-gray-700"><Trophy size={48}/></div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/20 to-transparent"></div>
                          <div className="absolute top-4 right-4">
                             {isRegistered ? (
                                 isPaid ? (
                                    <span className="flex items-center gap-2 bg-green-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                        <CheckCircle size={12} strokeWidth={4} /> Confirmado
                                    </span>
                                 ) : (
                                    <span className="flex items-center gap-2 bg-yellow-500 text-black text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg animate-pulse">
                                        <Clock size={12} strokeWidth={4} /> Aguardando Pagamento
                                    </span>
                                 )
                             ) : (
                                <span className="bg-[#D80000] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                    Inscrições Abertas
                                </span>
                             )}
                          </div>
                      </div>

                      <div className="p-8 flex flex-col flex-grow">
                        <h3 className="text-2xl font-black italic uppercase text-white mb-2">{stage.name}</h3>
                        <div className="space-y-3 mb-8 text-sm text-gray-400">
                          <p className="flex items-center gap-3"><Calendar size={16} className="text-[#D80000]"/> {new Date(stage.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                          <p className="flex items-center gap-3"><MapPin size={16} className="text-[#D80000]"/> {stage.location}</p>
                        </div>
                        <div className="mt-auto">
                            {isRegistered ? (
                              <div className={`rounded-xl p-4 border ${isPaid ? 'bg-green-900/10 border-green-900/30' : 'bg-yellow-900/10 border-yellow-900/30'}`}>
                                  {isPaid ? (
                                      <div className="text-center">
                                          <p className="text-green-500 font-black uppercase text-sm flex items-center justify-center gap-2 mb-1"><CheckCircle size={16}/> Inscrição Paga</p>
                                          <p className="text-xs text-green-400/60">Prepare sua moto e boa prova!</p>
                                      </div>
                                  ) : (
                                      <div className="text-center">
                                          <p className="text-yellow-500 font-black uppercase text-sm flex items-center justify-center gap-2 mb-1"><AlertCircle size={16}/> Pagamento Pendente</p>
                                          <p className="text-sm font-bold text-white mb-3">Valor: R$ {registration.total_price},00</p>
                                          {pixKey ? (
                                              <div className="bg-black/30 rounded p-2 border border-yellow-500/20 mb-2">
                                                  <p className="text-[10px] text-gray-400 mb-1">Chave PIX:</p>
                                                  <button onClick={handleCopyPix} className="flex items-center justify-center gap-2 w-full text-xs font-mono text-yellow-400 hover:text-white transition">
                                                      {pixKey} <Copy size={12}/>
                                                  </button>
                                              </div>
                                          ) : (
                                              <p className="text-[10px] text-red-400 mb-2">Chave PIX não configurada.</p>
                                          )}
                                          <p className="text-[10px] text-gray-500">Envie o comprovante para o organizador.</p>
                                      </div>
                                  )}
                              </div>
                            ) : (
                              <Link to={`/event/${stage.id}/register`}>
                                <button className="w-full bg-white text-black hover:bg-[#D80000] hover:text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-red-900/20 hover:-translate-y-1"><PlusCircle size={20} /> Inscrever-se</button>
                              </Link>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 bg-[#111] border border-dashed border-gray-800 rounded-2xl text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <p className="text-gray-500 text-lg">Nenhuma etapa disponível no momento.</p>
              </div>
            )}
          </section>

          {/* SEÇÃO DE CLASSIFICAÇÃO */}
          <section>
            <div className="flex items-center gap-4 mb-10">
               <Trophy size={32} className="text-[#D80000]" />
               <h2 className="text-3xl font-black uppercase italic">Classificação <span className="text-[#D80000]">Campeonato</span></h2>
            </div>
            <Standings />
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;