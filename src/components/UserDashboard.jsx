import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Standings from "./Standings"; 
import { Calendar, MapPin, PlusCircle, CheckCircle, Trophy, Flag, Cpu, Clock, AlertCircle, Tag, Copy, XCircle, UserCog, Save, X } from "lucide-react";
import API_URL from "../api";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stages, setStages] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [batchName, setBatchName] = useState(''); 
  const [pixKey, setPixKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // ESTADOS DO MODAL DE PERFIL
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: '', cpf: '', rg: '', 
    birth_date: '', emergency_phone: '', medical_insurance: '', 
    team: '', address: '', bike_number: '',modelo_moto: ''
  });

  // HELPER DE AUTH
  const getAuthHeaders = (token) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
  });

  // --- FUNÇÃO PARA CANCELAR A INSCRIÇÃO ---
  const handleCancelRegistration = async (registrationId, stageName) => {
    if (!user) return alert("Erro de autenticação.");
    if (!window.confirm(`Tem certeza que deseja cancelar sua inscrição para a etapa "${stageName}"? Esta ação não pode ser desfeita.`)) {
        return;
    }

    setIsCancelling(true);
    try {
        const response = await fetch(`${API_URL}/api/registrations/${registrationId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(user.token)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            setMyRegistrations(prev => prev.filter(r => r.id !== registrationId));
        } else {
            alert("Erro ao cancelar inscrição: " + result.error);
        }
    } catch (error) {
        console.error("Erro de conexão ao cancelar:", error);
        alert("Erro de conexão com o servidor ao cancelar a inscrição.");
    } finally {
        setIsCancelling(false);
    }
  };

  // --- FUNÇÕES DE PERFIL ---
  const handleOpenProfile = () => {
      if (user) {
          // Preenche o formulário com os dados atuais do usuário
          setProfileData({
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || '',
              cpf: user.cpf || '',
              rg: user.rg || '',
              birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
              emergency_phone: user.emergency_phone || '',
              medical_insurance: user.medical_insurance || '',
              team: user.team || '',
              address: user.address || '',
              bike_number: user.bike_number || '',
                modelo_moto: user.modelo_moto || ''
          });
          setIsProfileOpen(true);
      }
  };

  const handleProfileChange = (e) => {
      setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
      e.preventDefault();
      setIsSavingProfile(true);

      try {
          const response = await fetch(`${API_URL}/api/users/${user.id}`, {
              method: 'PUT',
              headers: getAuthHeaders(user.token),
              body: JSON.stringify({
                  ...profileData,
                  role: user.role,     // Mantém o papel original
                  chip_id: user.chip_id // Mantém o chip original (geralmente editado só por admin)
              })
          });

          if (response.ok) {
              alert("Dados atualizados com sucesso!");
              setIsProfileOpen(false);
              // Recarrega os dados para atualizar a tela
              fetchData(user.id, user.token, user);
          } else {
              const errorData = await response.json();
              alert("Erro ao atualizar: " + (errorData.error || response.statusText));
          }
      } catch (error) {
          console.error("Erro ao salvar perfil:", error);
          alert("Erro de conexão.");
      } finally {
          setIsSavingProfile(false);
      }
  };


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchData(parsedUser.id, parsedUser.token, parsedUser); 
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchData = async (userId, token, initialUser) => {
    setLoading(true);
    let currentUserData = initialUser;

    try {
      // 1. Busca Detalhes Completos do Usuário
      const userRes = await fetch(`${API_URL}/api/users/${userId}`, {
          headers: getAuthHeaders(token)
      });
      
      if (userRes.ok) {
          const updatedUser = await userRes.json();
          // Mescla dados do storage com dados frescos do servidor
          // Preserva o token que está no initialUser mas não vem na rota GET /users/:id
          currentUserData = { ...updatedUser, token: initialUser.token };
          setUser(currentUserData); 
          localStorage.setItem('user', JSON.stringify(currentUserData));
      } else if (userRes.status === 403 || userRes.status === 401) {
          console.error("Token inválido ou expirado. Redirecionando.");
          localStorage.removeItem('user');
          navigate("/login");
          return;
      }

      // 2. Busca Etapas
      const stagesRes = await fetch(`${API_URL}/api/stages`);
      setStages(await stagesRes.json());

      // 3. Busca Inscrições
      const myRegRes = await fetch(`${API_URL}/api/registrations/user/${userId}`, {
          headers: getAuthHeaders(token)
      });
      setMyRegistrations(await myRegRes.json()); 

      // 4. Configurações (PIX)
      const pixRes = await fetch(`${API_URL}/api/settings/pix_key`);
      const pixData = pixRes.ok ? await pixRes.json() : { value: '' };
      setPixKey(pixData.value || '');

      // 5. Configurações (Batch Name)
      const batchRes = await fetch(`${API_URL}/api/settings/batch_name`); 
      const batchData = batchRes.ok ? await batchRes.json() : { value: '' };
      setBatchName(batchData.value || 'Lote Padrão de Inscrição');

    } catch (error) {
      console.error("Erro fatal ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
      if (pixKey) {
          navigator.clipboard.writeText(pixKey);
          alert("Chave PIX copiada!");
      }
  };

  if (loading || !user) {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
            <p className="text-xl">Carregando Dashboard...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      
      <Navbar />

      <main className="flex-grow relative">
        <div className="max-w-7xl mx-auto px-4 py-12">
          
          {/* CABEÇALHO */}
          <div className="mb-16 flex flex-col md:flex-row justify-between items-end border-b border-gray-800 pb-8 gap-6">
            <div>
              <span className="text-[#D80000] font-bold tracking-widest text-sm uppercase mb-2 block">Área do Piloto</span>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
                Olá, <span className="text-white">{user.name.split(' ')[0]}</span>
              </h1>
              <button 
                onClick={handleOpenProfile}
                className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white bg-[#111] border border-gray-800 hover:border-gray-600 px-4 py-2 rounded-full transition-all"
              >
                <UserCog size={16} /> Meus Dados
              </button>
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
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Chip id</p>
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

                  const endDate = stage.end_date ? new Date(stage.end_date) : new Date(stage.date);
                  endDate.setDate(endDate.getDate() + 1); 
                  endDate.setHours(23, 59, 59, 999); 
                  const isClosed = new Date() > endDate;

                  return (
                    <div key={stage.id} className={`bg-[#111] border rounded-2xl overflow-hidden transition-all duration-300 group shadow-lg flex flex-col ${isRegistered ? (isPaid ? 'border-green-900/50' : 'border-yellow-900/50') : (isClosed ? 'border-gray-800 opacity-75' : 'border-gray-800 hover:border-[#D80000]')}`}>
                      
                      {/* IMAGEM E STATUS */}
                      <div className="h-48 bg-neutral-900 relative overflow-hidden">
                          {stage.image_url ? (
                              <img 
                                src={stage.image_url.startsWith('http') ? stage.image_url : `${API_URL}${stage.image_url}`} 
                                className={`w-full h-full object-cover transition duration-700 ${isClosed && !isRegistered ? 'grayscale' : 'group-hover:scale-110'}`}
                              />
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
                             ) : isClosed ? (
                                <span className="flex items-center gap-2 bg-gray-700 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                    <XCircle size={12} strokeWidth={4} /> Encerrado
                                </span>
                             ) : (
                                <span className="bg-[#D80000] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                    Inscrições Abertas
                                </span>
                             )}
                          </div>
                      </div>

                      {/* CONTEÚDO */}
                      <div className="p-8 flex flex-col flex-grow">
                        <h3 className={`text-2xl font-black italic uppercase mb-2 ${isClosed && !isRegistered ? 'text-gray-500' : 'text-white'}`}>{stage.name}</h3>
                        <div className="space-y-3 mb-8 text-sm text-gray-400">
                          <p className="flex items-center gap-3"><Calendar size={16} className={isClosed && !isRegistered ? 'text-gray-600' : 'text-[#D80000]'}/> {new Date(stage.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                          <p className="flex items-center gap-3"><MapPin size={16} className={isClosed && !isRegistered ? 'text-gray-600' : 'text-[#D80000]'}/> {stage.location}</p>
                        </div>
                        
                        <div className="mt-auto">
                            {isRegistered ? (
                              <div className={`rounded-xl p-4 border ${isPaid ? 'bg-green-900/10 border-green-900/30' : 'bg-yellow-900/10 border-yellow-900/30'}`}>
                                  {isPaid ? (
                                      <div className="text-center">
                                          <p className="text-green-500 font-black uppercase text-sm flex items-center justify-center gap-2 mb-1"><CheckCircle size={16}/> Inscrição Paga</p>
                                          <button disabled className="w-full text-xs text-gray-700 bg-gray-900/20 border border-gray-900/50 py-2 rounded cursor-not-allowed">
                                              Cancelamento indisponível
                                          </button>
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
                                          
                                          <button
                                            onClick={() => handleCancelRegistration(registration.id, stage.name)}
                                            disabled={isCancelling}
                                            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-400 bg-red-900/20 border border-red-900/50 py-2 rounded transition hover:bg-red-900/50"
                                          >
                                            <XCircle size={14} /> {isCancelling ? 'Cancelando...' : 'Cancelar Inscrição'}
                                          </button>
                                          
                                      </div>
                                  )}
                              </div>
                            ) : isClosed ? (
                              <button disabled className="w-full bg-neutral-800 text-gray-500 font-black py-4 rounded-xl uppercase tracking-widest cursor-not-allowed border border-neutral-700 flex items-center justify-center gap-2">
                                <XCircle size={20} /> Inscrições Encerradas
                              </button>
                            ) : (
                              <Link to={`/event/${stage.id}/register`}>
                                <button className="w-full bg-white text-black hover:bg-[#D80000] hover:text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-red-900/20 hover:-translate-y-1">
                                  <PlusCircle size={20} /> Inscrever-se
                                </button>
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
               <h2 className="text-3xl font-black uppercase italic">Veja sua <span className="text-[#D80000]">Pontuação</span></h2>
            </div>
            <Standings />
          </section>

        </div>

        {/* --- MODAL DE MEUS DADOS --- */}
        {isProfileOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                    <div className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-[#111] z-10">
                        <h2 className="text-xl font-black italic uppercase flex items-center gap-2">
                            <UserCog className="text-[#D80000]" /> Meus Dados
                        </h2>
                        <button onClick={() => setIsProfileOpen(false)} className="text-gray-500 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Nome Completo</label>
                                <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} required className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#D80000] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">CPF</label>
                                <input type="text" name="cpf" value={profileData.cpf} readOnly className="w-full bg-neutral-900 border border-gray-800 rounded-lg p-3 text-gray-400 cursor-not-allowed" title="CPF não pode ser alterado." />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">RG</label>
                                <input type="text" name="rg" value={profileData.rg} onChange={handleProfileChange} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#D80000] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Data Nascimento</label>
                                <input type="date" name="birth_date" value={profileData.birth_date} onChange={handleProfileChange} required className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#D80000] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Telefone</label>
                                <input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange} required className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#D80000] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Tel. Urgência</label>
                                <input type="text" name="emergency_phone" value={profileData.emergency_phone} onChange={handleProfileChange} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#D80000] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Equipe</label>
                                <input type="text" name="team" value={profileData.team} onChange={handleProfileChange} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#D80000] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Convênio Médico</label>
                                <input type="text" name="medical_insurance" value={profileData.medical_insurance} onChange={handleProfileChange} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#D80000] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Nº Moto</label>
                                <input type="text" name="bike_number" value={profileData.bike_number} onChange={handleProfileChange} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#D80000] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Modelo da Moto</label>
                                <input type="text" name="modelo_moto" value={profileData.modelo_moto} onChange={handleProfileChange} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#D80000] focus:outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Endereço Completo</label>
                                <input type="text" name="address" value={profileData.address} onChange={handleProfileChange} placeholder="Rua, Número, Bairro, Cidade - UF" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#D80000] focus:outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Email</label>
                                <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} required className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#D80000] focus:outline-none" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
                            <button type="button" onClick={() => setIsProfileOpen(false)} className="px-6 py-3 rounded-lg text-sm font-bold text-gray-400 hover:bg-gray-800 transition">Cancelar</button>
                            <button type="submit" disabled={isSavingProfile} className="bg-[#D80000] hover:bg-red-700 text-white px-8 py-3 rounded-lg text-sm font-black uppercase tracking-wide flex items-center gap-2 shadow-lg hover:shadow-red-900/20 transition-all">
                                {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                                {!isSavingProfile && <Save size={18} />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;