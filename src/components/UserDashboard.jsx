import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Standings from "./Standings"; 
import EventCard from "./EventCard"; // <--- IMPORTANTE: Importar o componente
import { Flag, Trophy, Tag, CheckCircle, Clock, XCircle, AlertCircle, Copy, PlusCircle, UserCog, Save, X, Cpu } from "lucide-react"; 
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
    team: '', address: '', bike_number: '',modeloMoto: ''
  });

  const getAuthHeaders = (token) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
  });

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
        alert("Erro de conexão.");
    } finally {
        setIsCancelling(false);
    }
  };

  // Funções de Perfil (Omitidas para brevidade, mantenha as mesmas que já funcionam)
  const handleOpenProfile = () => {
      if (user) {
          setProfileData({
              name: user.name || '', email: user.email || '', phone: user.phone || '', cpf: user.cpf || '',
              rg: user.rg || '', birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
              emergency_phone: user.emergency_phone || '', medical_insurance: user.medical_insurance || '',
              team: user.team || '', address: user.address || '', bike_number: user.bike_number || '', modeloMoto: user.modelo_moto || ''
          });
          setIsProfileOpen(true);
      }
  };
  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const handleUpdateProfile = async (e) => {
      e.preventDefault(); setIsSavingProfile(true);
      try {
          const response = await fetch(`${API_URL}/api/users/${user.id}`, {
              method: 'PUT', headers: getAuthHeaders(user.token),
              body: JSON.stringify({ ...profileData, role: user.role, chip_id: user.chip_id })
          });
          if (response.ok) { alert("Dados atualizados!"); setIsProfileOpen(false); fetchData(user.id, user.token, user); } 
          else { const d = await response.json(); alert("Erro: " + d.error); }
      } catch (error) { alert("Erro conexão."); } finally { setIsSavingProfile(false); }
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
    try {
        // Apenas UMA requisição à API
        const response = await fetch(`${API_URL}/api/dashboard-data`, { 
            headers: getAuthHeaders(token) 
        });

        if (response.ok) {
            const data = await response.json();
            
            // Atualiza o utilizador garantindo que mantém o token
            const currentUserData = { ...data.user, token };
            setUser(currentUserData); 
            localStorage.setItem('user', JSON.stringify(currentUserData));

            // Distribui os restantes dados pelos estados
            setStages(data.stages);
            setMyRegistrations(data.registrations);
            setPixKey(data.pix_key || '');
            setBatchName(data.batch_name || 'Lote Padrão');
        } else if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('user'); 
            navigate("/login"); 
        }
    } catch (error) { 
        console.error("Erro ao carregar dados do dashboard:", error); 
    } finally { 
        setLoading(false); 
    }
};

  const handleCopyPix = () => { if (pixKey) { navigator.clipboard.writeText(pixKey); alert("Chave PIX copiada!"); } };

  if (loading || !user) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Carregando...</div>;

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
              <button onClick={handleOpenProfile} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white bg-[#111] border border-gray-800 hover:border-gray-600 px-4 py-2 rounded-full transition-all">
                <UserCog size={16} /> Meus Dados
              </button>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <div className="bg-[#111] px-6 py-4 rounded-xl border border-gray-800 flex items-center gap-4 flex-1 md:flex-none">
                    <div className="bg-[#D80000] w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(216,0,0,0.4)]"><span className="font-black text-black text-lg">#</span></div>
                    <div><p className="text-[10px] text-gray-500 uppercase font-bold">Moto Nº</p><p className="text-2xl font-black italic">{user.bike_number || "00"}</p></div>
                </div>
                <div className="bg-[#111] px-6 py-4 rounded-xl border border-gray-800 flex items-center gap-4 flex-1 md:flex-none">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${user.chip_id ? 'bg-blue-900/20 border-blue-500 text-blue-500' : 'bg-gray-800 border-gray-700 text-gray-600'}`}><Cpu size={20} /></div>
                    <div><p className="text-[10px] text-gray-500 uppercase font-bold">Chip id</p><p className={`text-xl font-black italic ${user.chip_id ? 'text-blue-400' : 'text-gray-600'}`}>{user.chip_id || "---"}</p></div>
                </div>
            </div>
          </div>

          {/* SEÇÃO DE ETAPAS */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4"><Flag size={32} className="text-[#D80000]" /><h2 className="text-3xl font-black uppercase italic">Minhas <span className="text-[#D80000]">Etapas</span></h2></div>
                {batchName && (<div className="hidden md:flex items-center gap-2 bg-yellow-900/20 border border-yellow-600/50 px-4 py-2 rounded-full"><Tag size={16} className="text-yellow-500"/><span className="text-yellow-500 font-bold text-sm uppercase tracking-wider">{batchName}</span></div>)}
            </div>

            {stages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stages.map((stage) => {
                  const registration = myRegistrations.find(r => r.stage_id === stage.id);
                  const isRegistered = !!registration;
                  const isPaid = registration?.status === 'paid';
                  const endDate = stage.end_date ? new Date(stage.end_date) : new Date(stage.date);
                  endDate.setDate(endDate.getDate() + 1); endDate.setHours(23, 59, 59, 999); 
                  const isClosed = new Date() > endDate;

                  // LÓGICA DO BADGE DE STATUS PARA O CARD
                  let statusBadge = null;
                  if (isRegistered) {
                      if (isPaid) statusBadge = <span className="flex items-center gap-2 bg-green-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg"><CheckCircle size={12} strokeWidth={4} /> Confirmado</span>;
                      else statusBadge = <span className="flex items-center gap-2 bg-yellow-500 text-black text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg animate-pulse"><Clock size={12} strokeWidth={4} /> Pendente</span>;
                  } else if (isClosed) {
                      statusBadge = <span className="flex items-center gap-2 bg-gray-700 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg"><XCircle size={12} strokeWidth={4} /> Encerrado</span>;
                  } else {
                      statusBadge = <span className="bg-[#D80000] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Inscrições Abertas</span>;
                  }

                  // LÓGICA DO CONTEÚDO DO CARD (BOTÕES)
                  return (
                    <EventCard key={stage.id} stage={stage} statusBadge={statusBadge}>
                        {/* CONTEÚDO INJETADO DENTRO DO CARD (AREA DE AÇÃO) */}
                        {isRegistered ? (
                            <div className={`rounded-xl p-3 border ${isPaid ? 'bg-green-900/10 border-green-900/30' : 'bg-yellow-900/10 border-yellow-900/30'}`}>
                                {isPaid ? (
                                    <div className="text-center">
                                        <p className="text-green-500 font-black uppercase text-xs flex items-center justify-center gap-2 mb-1"><CheckCircle size={14}/> Inscrição Paga</p>
                                        <button disabled className="w-full text-[10px] text-gray-500 bg-black/20 py-2 rounded cursor-not-allowed uppercase font-bold">Cancelamento indisponível</button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-yellow-500 font-black uppercase text-xs flex items-center justify-center gap-2 mb-1"><AlertCircle size={14}/> Pagamento Pendente</p>
                                        <p className="text-sm font-bold text-white mb-2">Valor: R$ {registration.total_price},00</p>
                                        {pixKey ? (
                                            <div className="bg-black/40 rounded p-2 border border-yellow-500/20 mb-2">
                                                <button onClick={handleCopyPix} className="flex items-center justify-center gap-2 w-full text-[10px] font-mono text-yellow-400 hover:text-white transition">{pixKey} <Copy size={10}/></button>
                                            </div>
                                        ) : <p className="text-[10px] text-red-400 mb-2">Chave PIX não config.</p>}
                                        <button onClick={() => handleCancelRegistration(registration.id, stage.name)} disabled={isCancelling} className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-red-400 bg-red-900/20 border border-red-900/50 py-2 rounded transition hover:bg-red-900/50"><XCircle size={12} /> {isCancelling ? '...' : 'Cancelar'}</button>
                                    </div>
                                )}
                            </div>
                        ) : isClosed ? (
                            <button disabled className="w-full bg-neutral-800 text-gray-500 font-black py-3 rounded-lg uppercase tracking-widest cursor-not-allowed border border-neutral-700 flex items-center justify-center gap-2 text-sm"><XCircle size={16} /> Encerrado</button>
                        ) : (
                            <Link to={`/event/${stage.id}/register`}>
                                <button className="w-full bg-white text-black hover:bg-[#D80000] hover:text-white font-black py-3 rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-red-900/20 hover:-translate-y-1 text-sm"><PlusCircle size={16} /> Inscrever-se</button>
                            </Link>
                        )}
                    </EventCard>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 bg-[#111] border border-dashed border-gray-800 rounded-2xl text-center"><Calendar className="mx-auto h-12 w-12 text-gray-600 mb-4" /><p className="text-gray-500 text-lg">Nenhuma etapa disponível no momento.</p></div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-4 mb-10"><Trophy size={32} className="text-[#D80000]" /><h2 className="text-3xl font-black uppercase italic">Veja sua <span className="text-[#D80000]">Pontuação</span></h2></div>
            <Standings />
          </section>
        </div>

        {/* --- MODAL (Mantido igual, apenas renderizado se isProfileOpen) --- */}
        {isProfileOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                    <div className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-[#111] z-10">
                        <h2 className="text-xl font-black italic uppercase flex items-center gap-2"><UserCog className="text-[#D80000]" /> Meus Dados</h2>
                        <button onClick={() => setIsProfileOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                        {/* Formulário igual ao anterior */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-xs text-gray-500 uppercase font-bold mb-1">Nome</label><input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" /></div>
                            <div><label className="block text-xs text-gray-500 uppercase font-bold mb-1">CPF</label><input type="text" value={profileData.cpf} readOnly className="w-full bg-neutral-900 border border-gray-800 rounded-lg p-3 text-gray-400" /></div>
                            <div><label className="block text-xs text-gray-500 uppercase font-bold mb-1">Nº Moto</label><input type="text" name="bike_number" value={profileData.bike_number} onChange={handleProfileChange} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" /></div>
                            <div><label className="block text-xs text-gray-500 uppercase font-bold mb-1">Modelo Moto</label><input type="text" name="modeloMoto" value={profileData.modeloMoto} onChange={handleProfileChange} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" /></div>
                            <div className="md:col-span-2"><label className="block text-xs text-gray-500 uppercase font-bold mb-1">Email</label><input type="text" name="email" value={profileData.email} onChange={handleProfileChange} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white" /></div>
                            {/* Adicione os outros campos conforme necessário */}
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
                            <button type="button" onClick={() => setIsProfileOpen(false)} className="px-6 py-3 rounded-lg text-sm font-bold text-gray-400 hover:bg-gray-800">Cancelar</button>
                            <button type="submit" disabled={isSavingProfile} className="bg-[#D80000] hover:bg-red-700 text-white px-8 py-3 rounded-lg text-sm font-black uppercase tracking-wide flex items-center gap-2">{isSavingProfile ? '...' : 'Salvar'}</button>
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