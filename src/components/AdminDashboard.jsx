import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  LogOut, Calendar, MapPin, Upload, Plus, Edit3, AlertCircle, CheckCircle, 
  Check, ArrowLeft, Trash2, RefreshCw, X, ImageIcon, Search, Users, 
  Shield, Bike, ClipboardList, DollarSign, Wallet, MessageCircle, Tag, Save, Layers, FileText, Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import API_URL from '../api';

const VELOCROSS_CATEGORIES = [
  "50cc", "65cc", "Feminino", "Free Force One", "Importada Amador", 
  "Junior", "Nacional Amador", "Open Importada", "Open Nacional", 
  "Over 250", "Ultimate 250x230", "VX 250f Nacional", "VX230", 
  "VX3 Importada", "VX3 Nacional", "VX4", "VX5", "VX6", "VX7"
];

const AdminDashboard = () => {
  const navigate = useNavigate(); 
  const [activeTab, setActiveTab] = useState('events'); 
  
  // --- ESTADOS GERAIS ---
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // --- ESTADOS DO CRUD DE EVENTOS ---
  const [formData, setFormData] = useState({ id: null, name: '', location: '', date: '' });
  const [imageFile, setImageFile] = useState(null);

  // --- ESTADOS DE USUÁRIOS ---
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState(''); 
  const [editingUser, setEditingUser] = useState(null); 
  const [userForm, setUserForm] = useState({ 
      id: null, name: '', email: '', phone: '', bike_number: '', chip_id: '', role: 'user' 
  });

  // --- ESTADOS DA PONTUAÇÃO ---
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uploadedCategories, setUploadedCategories] = useState([]); 
  const [categoryResults, setCategoryResults] = useState([]); 
  const [isReplacing, setIsReplacing] = useState(false); 

  // --- ESTADOS DE INSCRIÇÕES ---
  const [selectedStageReg, setSelectedStageReg] = useState(null); 
  const [registrationsList, setRegistrationsList] = useState([]); 
  const [regSearch, setRegSearch] = useState(''); 

  // --- ESTADOS DE PLANOS E CONFIGURAÇÕES (ALTERADO) ---
  const [selectedStagePlan, setSelectedStagePlan] = useState(null); // Para selecionar qual etapa editar
  const [plans, setPlans] = useState([]); 
  const [localPlans, setLocalPlans] = useState([]); 
  const [batchName, setBatchName] = useState(''); 
  const [pixKey, setPixKey] = useState(''); 

  // --- HELPER: PEGAR TOKEN DO USUÁRIO ---
  const getAuthHeaders = (isJson = true) => {
      const user = JSON.parse(localStorage.getItem('user'));
      const headers = { 'Authorization': `Bearer ${user?.token}` };
      if (isJson) headers['Content-Type'] = 'application/json';
      return headers;
  };

  // --- PROTEÇÃO DE ROTA ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        alert("Acesso restrito. Faça login como administrador.");
        navigate('/login');
        return;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== 'admin') {
        alert("Você não tem permissão para acessar esta área.");
        navigate('/dashboard'); 
    }
  }, [navigate]);

  // Carregamentos Iniciais
  useEffect(() => { fetchStages(); }, []);
  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [activeTab]);
  
  // NOVO: Carrega PIX Global ao entrar na aba, mas não os planos ainda (espera selecionar etapa)
  useEffect(() => { 
      if (activeTab === 'plans') {
          fetchGlobalSettings(); 
          setSelectedStagePlan(null); // Reseta seleção ao entrar na aba
      } 
  }, [activeTab]);
  
  // Efeitos condicionais
  useEffect(() => { if (selectedStage) fetchCategoryStatus(selectedStage.id); }, [selectedStage]);
  useEffect(() => { if (selectedStage && selectedCategory) fetchCategoryResults(selectedStage.id, selectedCategory); }, [selectedCategory]);
  useEffect(() => { if (selectedStageReg) fetchRegistrations(selectedStageReg.id); }, [selectedStageReg]);
  
  // NOVO: Carrega preços da etapa específica quando selecionada
  useEffect(() => {
      if (selectedStagePlan) {
          fetchStagePrices(selectedStagePlan);
      }
  }, [selectedStagePlan]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // =====================================================
  // API FUNCTIONS
  // =====================================================

  const fetchStages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stages`);
      setStages(await response.json());
    } catch (error) { console.error(error); }
  };

  // --- EVENTOS ---
  const handleSaveStage = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return showMessage("Preencha nome e data", "error");
    setLoading(true);
    
    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('location', formData.location);
    dataToSend.append('date', formData.date);
    if (imageFile) dataToSend.append('image', imageFile);

    try {
      let url = formData.id ? `${API_URL}/api/stages/${formData.id}` : `${API_URL}/api/stages`;
      let method = formData.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, { 
          method: method, 
          headers: getAuthHeaders(false), 
          body: dataToSend 
      });
      
      if (res.ok) {
        showMessage(formData.id ? "Atualizado!" : "Criado!", "success");
        resetForm();
        fetchStages();
      } else showMessage("Erro ao salvar", "error");
    } catch (error) { showMessage("Erro conexão", "error"); } finally { setLoading(false); }
  };

  const handleDeleteStage = async (id) => {
    if (!window.confirm("Isso apagará todas as inscrições e resultados!")) return;
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/api/stages/${id}`, { 
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (res.ok) { showMessage("Excluído.", "success"); fetchStages(); resetForm(); }
    } catch (error) { showMessage("Erro.", "error"); } finally { setLoading(false); }
  };

  const handleEditClick = (stage) => {
    setFormData({ id: stage.id, name: stage.name, location: stage.location, date: stage.date });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const resetForm = () => { setFormData({ id: null, name: '', location: '', date: '' }); setImageFile(null); };

  // --- USUÁRIOS ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/api/users`, {
            headers: getAuthHeaders()
        });
        if(res.ok) setUsersList(await res.json());
        else if(res.status === 403) handleLogout();
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };
  const handleEditUserClick = (user) => {
      setEditingUser(user.id);
      setUserForm({ id: user.id, name: user.name, email: user.email, phone: user.phone, bike_number: user.bike_number||'', chip_id: user.chip_id||'', role: user.role });
  };
  const handleCancelEditUser = () => { setEditingUser(null); setUserForm({ id: null, name: '', email: '', phone: '', bike_number: '', chip_id: '', role: 'user' }); };
  const handleSaveUser = async (e) => {
      e.preventDefault(); setLoading(true);
      try {
          const res = await fetch(`${API_URL}/api/users/${userForm.id}`, { 
              method: 'PUT', 
              headers: getAuthHeaders(), 
              body: JSON.stringify(userForm)
          });
          if (res.ok) { showMessage("Usuário atualizado!", "success"); setEditingUser(null); fetchUsers(); }
      } catch (error) { showMessage("Erro.", "error"); } finally { setLoading(false); }
  };
  const handleDeleteUser = async (id) => {
      if(!window.confirm("Tem certeza?")) return;
      try { 
          await fetch(`${API_URL}/api/users/${id}`, { 
              method: 'DELETE',
              headers: getAuthHeaders()
          }); 
          showMessage("Removido.", "success"); fetchUsers(); 
      } catch (e) { showMessage("Erro", "error"); }
  };

  // --- PONTUAÇÃO ---
  const fetchCategoryStatus = async (stageId) => { try { const r = await fetch(`${API_URL}/api/stages/${stageId}/categories-status`); setUploadedCategories(await r.json()); } catch (e) {} };
  const fetchCategoryResults = async (stageId, category) => { 
      setLoading(true); 
      try { 
          const r = await fetch(`${API_URL}/api/stages/${stageId}/results/${encodeURIComponent(category)}`); 
          const d = await r.json(); 
          setCategoryResults(d); 
          setIsReplacing(d.length === 0); 
      } catch(e) {} finally { setLoading(false); } 
  };
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]; if (!file) return;
    const uploadData = new FormData(); uploadData.append('file', file); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/stages/${selectedStage.id}/upload/${encodeURIComponent(selectedCategory)}`, { 
          method: 'POST', 
          headers: getAuthHeaders(false),
          body: uploadData 
      });
      if (res.ok) { showMessage("Resultados atualizados!", "success"); fetchCategoryStatus(selectedStage.id); const d = await res.json(); if(d.data) { setCategoryResults(d.data); setIsReplacing(false); } else { fetchCategoryResults(selectedStage.id, selectedCategory); } }
      else showMessage("Erro no upload", "error");
    } catch (e) { showMessage("Falha envio", "error"); } finally { setLoading(false); event.target.value = null; }
  };

  // --- INSCRIÇÕES ---
  const fetchRegistrations = async (stageId) => {
      setLoading(true);
      try {
          const res = await fetch(`${API_URL}/api/registrations/stage/${stageId}`, {
              headers: getAuthHeaders()
          });
          setRegistrationsList(await res.json());
      } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const togglePaymentStatus = async (reg) => {
      const newStatus = reg.status === 'paid' ? 'pending' : 'paid';
      try {
          const res = await fetch(`${API_URL}/api/registrations/${reg.id}/status`, {
              method: 'PUT', 
              headers: getAuthHeaders(), 
              body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
              setRegistrationsList(prev => prev.map(item => item.id === reg.id ? { ...item, status: newStatus } : item));
              showMessage(newStatus === 'paid' ? "Pagamento Confirmado!" : "Status alterado para Pendente", "success");
          }
      } catch (error) { showMessage("Erro ao atualizar status", "error"); }
  };

  const handleGeneratePDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(selectedStageReg.name, 14, 20);
      doc.setFontSize(12);
      doc.text(`Lista de Inscritos - Gerado em ${new Date().toLocaleDateString()}`, 14, 28);
      const tableColumn = ["Piloto", "Moto", "Categorias", "Status", "Valor"];
      const tableRows = [];
      
      const filteredRegs = registrationsList.filter(reg => 
        reg.pilot_name.toLowerCase().includes(regSearch.toLowerCase()) || 
        (reg.pilot_number && reg.pilot_number.includes(regSearch))
      );

      filteredRegs.forEach(reg => {
          const regData = [
              reg.pilot_name,
              reg.pilot_number || '-',
              reg.categories,
              reg.status === 'paid' ? 'PAGO' : 'PENDENTE',
              `R$ ${reg.total_price}`
          ];
          tableRows.push(regData);
      });
      doc.autoTable({ head: [tableColumn], body: tableRows, startY: 35, theme: 'grid', styles: { fontSize: 10 }, headStyles: { fillColor: [220, 0, 0] } });
      doc.save(`Lista_Inscritos_${selectedStageReg.name}.pdf`);
  };

  const totalInscritos = registrationsList.length;
  const totalReceita = registrationsList.reduce((acc, curr) => acc + (curr.total_price || 0), 0);
  const totalPendente = registrationsList.filter(r => r.status === 'pending').reduce((acc, curr) => acc + (curr.total_price || 0), 0);

  // --- PLANOS E LOTES POR ETAPA (LÓGICA NOVA) ---
  
  // 1. Busca configurações globais (PIX)
  const fetchGlobalSettings = async () => {
      try { 
          const res = await fetch(`${API_URL}/api/settings/pix_key`); 
          const data = await res.json(); 
          setPixKey(data.value || '');
      } catch(e) { console.error(e); }
  };

  // 2. Busca preços da etapa selecionada
  const fetchStagePrices = async (stageId) => {
      setLoading(true);
      try {
          const res = await fetch(`${API_URL}/api/stages/${stageId}/prices`);
          const data = await res.json();
          setBatchName(data.batch_name); // Lote específico da etapa
          setLocalPlans(data.plans);     // Preços específicos da etapa
      } catch (error) { 
          console.error(error); 
          showMessage("Erro ao carregar preços.", "error");
      } finally { 
          setLoading(false); 
      }
  };

  // 3. Atualiza preço no estado local
  const handleLocalPriceChange = (id, newPrice) => {
      setLocalPlans(prev => prev.map(p => p.id === id ? { ...p, price: parseFloat(newPrice) || 0 } : p));
  };

  // 4. Salva tudo (Preços da Etapa + Lote da Etapa + PIX Global)
  const handleSaveStagePrices = async () => {
      if (!selectedStagePlan) return;
      if (!window.confirm("Tem certeza que deseja SALVAR para esta etapa?")) return;
      
      setLoading(true);
      try {
          // Salva configurações da etapa
          await fetch(`${API_URL}/api/stages/${selectedStagePlan}/prices`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify({ 
                  batch_name: batchName,
                  plans: localPlans 
              })
          });

          // Salva PIX Global
          await fetch(`${API_URL}/api/settings/pix_key`, {
              method: 'PUT', 
              headers: getAuthHeaders(), 
              body: JSON.stringify({ value: pixKey })
          });

          showMessage("Preços e configurações salvos!", "success");
      } catch (error) { 
          showMessage("Erro ao salvar.", "error"); 
      } finally { 
          setLoading(false); 
      }
  };

  // --- BACKUP ---
  const handleDownloadBackup = async () => {
      try {
          const res = await fetch(`${API_URL}/api/admin/backup`, { headers: getAuthHeaders(false) });
          if(res.ok) {
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `backup_tamura_${new Date().toISOString().slice(0,10)}.sqlite`;
              document.body.appendChild(a); a.click(); a.remove();
              showMessage("Backup baixado com sucesso!", "success");
          } else { showMessage("Erro ao baixar backup.", "error"); }
      } catch(e) { showMessage("Erro de conexão.", "error"); }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans">
      
      {/* HEADER */}
      <header className="bg-neutral-800 border-b border-neutral-700 p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-red-500 uppercase italic border-l-4 border-neutral-600 pl-4">
                Painel Admin
            </h1>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto max-w-full pb-2 xl:pb-0">
            <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-700">
                {['events', 'scores', 'registrations', 'plans', 'users'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded text-sm font-bold uppercase transition ${activeTab === tab ? 'bg-neutral-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>
                        {tab === 'events' ? 'Eventos' : tab === 'scores' ? 'Pontuação' : tab === 'registrations' ? 'Inscrições' : tab === 'plans' ? 'Planos/Lotes' : 'Pilotos'}
                    </button>
                ))}
            </div>
            <div className="h-6 w-px bg-neutral-700 hidden xl:block"></div>
            <button onClick={handleDownloadBackup} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 px-3 py-2 border border-blue-900 rounded hover:bg-blue-900/20 transition text-xs font-bold uppercase"><Download size={16} /> Backup</button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-500 px-3 py-2 rounded transition text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {message.text && (
          <div className={`fixed top-20 right-6 z-50 px-6 py-3 rounded shadow-lg border-l-4 ${message.type === 'error' ? 'bg-red-900 border-red-500' : 'bg-green-800 border-green-500'} flex gap-2 items-center animate-fade-in`}>
            {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />} {message.text}
          </div>
        )}

        {/* --- ABA EVENTOS --- */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 h-min sticky top-24">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                {formData.id ? ( <><Edit3 className="text-yellow-500"/> Editar Evento</> ) : ( <><Plus className="text-red-500"/> Novo Evento</> )}
              </h2>
              <form onSubmit={handleSaveStage} className="space-y-4">
                <div><label className="text-xs text-gray-500 font-bold uppercase ml-1">Nome</label><input className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div><label className="text-xs text-gray-500 font-bold uppercase ml-1">Local</label><input className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
                <div><label className="text-xs text-gray-500 font-bold uppercase ml-1">Data</label><input type="date" className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                <div>
                    <label className="text-xs text-gray-500 font-bold uppercase ml-1">Imagem Capa</label>
                    <div className="relative"><input id="stage-image-input" type="file" accept="image/*" className="w-full text-sm text-gray-400 bg-neutral-900 border border-neutral-700 rounded p-2" onChange={(e) => setImageFile(e.target.files[0])} /><ImageIcon className="absolute right-3 top-3 text-gray-600" size={16}/></div>
                </div>
                <div className="flex gap-2 pt-2">
                    {formData.id && <button type="button" onClick={resetForm} className="flex-1 bg-neutral-700 p-3 rounded font-bold uppercase text-xs">Cancelar</button>}
                    <button type="submit" disabled={loading} className={`flex-1 ${formData.id ? 'bg-yellow-600' : 'bg-red-600'} text-white p-3 rounded font-bold uppercase`}>{loading?'...':(formData.id?'Salvar':'Criar')}</button>
                </div>
              </form>
            </div>
            <div className="lg:col-span-2 bg-neutral-800 rounded-xl border border-neutral-700 p-6">
              <h3 className="font-bold text-gray-200 mb-4 flex items-center gap-2"><Calendar size={20} className="text-red-500"/> Eventos</h3>
              <div className="space-y-3">
                {stages.map(stage => (
                  <div key={stage.id} className={`p-4 bg-neutral-900/50 rounded-lg flex flex-col sm:flex-row justify-between items-center border border-neutral-700 ${formData.id===stage.id?'border-yellow-500':''}`}>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="h-12 w-12 rounded bg-neutral-800 overflow-hidden flex-shrink-0 border border-neutral-700">
                             {stage.image_url ? <img src={`${API_URL}${stage.image_url}`} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={20}/></div>}
                        </div>
                        <div>
                            <div className="font-bold text-white">{stage.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1"><MapPin size={12}/> {stage.location} | <Calendar size={12}/> {new Date(stage.date + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                        <button onClick={() => handleEditClick(stage)} className="text-gray-400 hover:text-yellow-400 p-2"><Edit3 size={18} /></button>
                        <button onClick={() => handleDeleteStage(stage.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- ABA PONTUAÇÃO --- */}
        {activeTab === 'scores' && (
          <div>
            {!selectedStage && (
              <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><CheckCircle className="text-red-500"/> Selecione a Etapa</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stages.map(stage => (
                    <button key={stage.id} onClick={() => setSelectedStage(stage)} className="p-6 bg-neutral-900 border border-neutral-700 rounded-lg hover:border-red-500 text-left group">
                      <div className="text-red-500 text-xs font-bold uppercase mb-2">{new Date(stage.date + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                      <div className="text-lg font-bold text-gray-200 group-hover:text-white">{stage.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectedStage && !selectedCategory && (
              <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700">
                <button onClick={() => setSelectedStage(null)} className="mb-6 text-sm text-gray-400 hover:text-white flex items-center gap-2"><ArrowLeft size={16}/> Voltar</button>
                <h2 className="text-2xl font-bold mb-6 border-b border-neutral-700 pb-4">{selectedStage.name} | Categorias</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {VELOCROSS_CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-3 ${uploadedCategories.includes(cat) ? 'bg-green-900/10 border-green-800/50' : 'bg-neutral-900 border-neutral-700 hover:border-red-500'}`}>
                        {uploadedCategories.includes(cat) ? <CheckCircle className="text-green-500" size={24} /> : <div className="w-6 h-6 rounded-full border-2 border-neutral-600" />}
                        <span className="font-bold text-sm text-center">{cat}</span>
                      </button>
                  ))}
                </div>
              </div>
            )}
            {selectedStage && selectedCategory && (
              <div className="animate-fade-in">
                <button onClick={() => { setSelectedCategory(null); setCategoryResults([]); setIsReplacing(false); }} className="mb-4 text-sm text-gray-400 hover:text-white flex items-center gap-1"><ArrowLeft size={16}/> Voltar</button>
                <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-neutral-700 bg-neutral-900 flex justify-between items-center">
                    <div><h2 className="text-3xl font-black italic uppercase text-white">{selectedCategory}</h2><p className="text-red-500 text-sm font-bold uppercase">{selectedStage.name}</p></div>
                    {!isReplacing && categoryResults.length > 0 && <button onClick={() => setIsReplacing(true)} className="flex items-center gap-2 bg-neutral-700 text-white px-4 py-2 rounded text-sm font-bold"><RefreshCw size={16}/> Substituir</button>}
                    {isReplacing && categoryResults.length > 0 && <button onClick={() => setIsReplacing(false)} className="text-sm text-gray-400 underline">Cancelar</button>}
                  </div>
                  {!isReplacing && categoryResults.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-900/50 text-gray-400 text-xs uppercase tracking-wider border-b border-neutral-700">
                                <th className="p-4 text-center">Pos</th>
                                <th className="p-4">Piloto</th>
                                <th className="p-4 text-center">Nº</th>
                                <th className="p-4 text-center">Voltas</th>
                                <th className="p-4 hidden md:table-cell">Tempo Total</th>
                                <th className="p-4 hidden md:table-cell">Dif. Líder</th>
                                <th className="p-4 hidden md:table-cell">Melhor Volta</th>
                                <th className="p-4 text-center text-white bg-red-900/20 w-24">PTS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700 text-sm text-gray-300">
                          {categoryResults.map((row, i) => (
                            <tr key={i}>
                                <td className="p-4 text-center font-bold text-white">{row.position}º</td>
                                <td className="p-4 font-medium text-white">{row.pilot_name}</td>
                                <td className="p-4 text-center text-yellow-500 font-bold">{row.pilot_number}</td>
                                <td className="p-4 text-center text-gray-400">{row.laps}</td>
                                <td className="p-4 text-xs text-gray-400 hidden md:table-cell">{row.total_time}</td>
                                <td className="p-4 text-xs text-gray-500 hidden md:table-cell">{row.diff_first}</td>
                                <td className="p-4 text-green-400 text-xs hidden md:table-cell">{row.best_lap}</td>
                                <td className="p-4 text-center font-black text-red-500 bg-red-900/10">{row.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {isReplacing && (
                    <div className="p-12 flex flex-col items-center justify-center bg-neutral-900/50">
                      <div className="mb-8 text-center"><h3 className="text-xl text-white font-bold mb-2">Upload de Resultados</h3><p className="text-gray-400 text-sm">Selecione o arquivo Excel (.xlsx).</p></div>
                      <label className="w-full max-w-lg flex flex-col items-center justify-center h-48 border-2 border-dashed border-neutral-600 rounded-xl cursor-pointer hover:border-red-500 hover:bg-neutral-800">
                        <Upload size={48} className="text-gray-500 mb-4" /><p className="text-lg text-gray-300 font-bold">{loading?'...':'Selecionar Arquivo'}</p>
                        <input type="file" className="hidden" accept=".csv, .xlsx, .xls" disabled={loading} onChange={handleFileUpload} />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ABA INSCRIÇÕES (COM PDF E BUSCA) --- */}
        {activeTab === 'registrations' && (
          <div className="animate-fade-in">
             {!selectedStageReg ? (
                 <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ClipboardList className="text-green-500"/> Gerenciar Inscrições - Selecione a Etapa</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stages.map(stage => (
                        <button key={stage.id} onClick={() => setSelectedStageReg(stage)} className="p-6 bg-neutral-900 border border-neutral-700 rounded-lg hover:border-green-500 text-left group transition-all hover:-translate-y-1 shadow-md">
                        <div className="text-green-500 text-xs font-bold uppercase mb-2">{new Date(stage.date + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                        <div className="text-lg font-bold text-gray-200 group-hover:text-white">{stage.name}</div>
                        </button>
                    ))}
                    </div>
                 </div>
             ) : (
                 <div>
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setSelectedStageReg(null)} className="text-sm text-gray-400 hover:text-white flex items-center gap-2"><ArrowLeft size={16}/> Voltar</button>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar Piloto..." 
                                className="bg-neutral-900 border border-neutral-600 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:border-green-500 outline-none w-64"
                                value={regSearch}
                                onChange={(e) => setRegSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg flex items-center justify-between"><div><p className="text-gray-500 text-xs font-bold uppercase">Total Inscritos</p><p className="text-3xl font-black text-white">{totalInscritos}</p></div><Users size={32} className="text-blue-500 opacity-50"/></div>
                        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg flex items-center justify-between"><div><p className="text-gray-500 text-xs font-bold uppercase">Receita Estimada</p><p className="text-3xl font-black text-white">R$ {totalReceita},00</p></div><DollarSign size={32} className="text-green-500 opacity-50"/></div>
                        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg flex items-center justify-between"><div><p className="text-gray-500 text-xs font-bold uppercase">A Receber (Pendente)</p><p className="text-3xl font-black text-yellow-500">R$ {totalPendente},00</p></div><Wallet size={32} className="text-yellow-500 opacity-50"/></div>
                    </div>
                    <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-neutral-700 bg-neutral-900 flex justify-between items-center">
                            <div><h2 className="text-2xl font-black italic uppercase text-white">{selectedStageReg.name}</h2><p className="text-gray-500 text-sm">Lista de Pilotos Inscritos</p></div>
                            <button onClick={handleGeneratePDF} className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded font-bold flex items-center gap-2 shadow-lg transition-all"><FileText size={18} /> Imprimir Lista (PDF)</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead><tr className="bg-neutral-900/50 text-gray-400 text-xs uppercase tracking-wider border-b border-neutral-700"><th className="p-4">Piloto</th><th className="p-4">Contato</th><th className="p-4 text-center">Nº Moto</th><th className="p-4">Categorias</th><th className="p-4">Pacote</th><th className="p-4 text-right">Valor</th><th className="p-4 text-center">Pagamento</th></tr></thead>
                                <tbody className="divide-y divide-neutral-700 text-sm text-gray-300">
                                    {registrationsList.length > 0 ? (
                                        registrationsList
                                        .filter(reg => reg.pilot_name.toLowerCase().includes(regSearch.toLowerCase()) || (reg.pilot_number && reg.pilot_number.includes(regSearch)))
                                        .map(reg => (
                                            <tr key={reg.id} className="hover:bg-neutral-700/30 transition">
                                                <td className="p-4 font-bold text-white">{reg.pilot_name}<div className="text-xs text-gray-500 font-normal">{reg.cpf}</div></td>
                                                <td className="p-4 flex items-center gap-2">{reg.phone}{reg.phone && (<a href={`https://wa.me/55${reg.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-500 hover:text-green-400 p-1 bg-green-900/20 rounded" title="WhatsApp"><MessageCircle size={16} /></a>)}</td>
                                                <td className="p-4 text-center"><span className="font-mono font-bold text-yellow-500">{reg.pilot_number}</span></td>
                                                <td className="p-4 text-xs max-w-xs truncate" title={reg.categories}>{reg.categories}</td>
                                                <td className="p-4 text-xs text-gray-400">{reg.plan_name}</td>
                                                <td className="p-4 text-right font-bold text-white">R$ {reg.total_price},00</td>
                                                <td className="p-4 text-center"><button onClick={() => togglePaymentStatus(reg)} className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition border ${reg.status === 'paid' ? 'bg-green-900/20 text-green-500 border-green-900/50 hover:bg-green-900/40' : 'bg-yellow-900/20 text-yellow-500 border-yellow-900/50 hover:bg-yellow-900/40'}`}>{reg.status === 'paid' ? 'Pago' : 'Pendente'}</button></td>
                                            </tr>
                                    ))) : (<tr><td colSpan="7" className="p-12 text-center text-gray-500">Nenhuma inscrição realizada ainda.</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                 </div>
             )}
          </div>
        )}

        {/* --- ABA PLANOS E LOTES (LÓGICA NOVA: SELEÇÃO DE ETAPA) --- */}
        {activeTab === 'plans' && (
            <div className="animate-fade-in">
                {!selectedStagePlan ? (
                    <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Tag className="text-yellow-500"/> Selecione a Etapa para Editar Lote</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {stages.map(stage => (
                                <button key={stage.id} onClick={() => setSelectedStagePlan(stage.id)} className="p-6 bg-neutral-900 border border-neutral-700 rounded-lg hover:border-yellow-500 text-left group transition-all">
                                    <div className="text-yellow-500 text-xs font-bold uppercase mb-2">{new Date(stage.date + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                                    <div className="text-lg font-bold text-gray-200 group-hover:text-white">{stage.name}</div>
                                    <div className="text-xs text-gray-500 mt-2">Lote Atual: {stage.batch_name || 'Padrão'}</div>
                                </button>
                            ))}
                        </div>
                        
                        {/* Área PIX GLOBAL (Visível aqui para facilitar) */}
                        <div className="mt-8 pt-6 border-t border-neutral-700">
                            <label className="text-xs text-green-500 font-bold uppercase flex items-center gap-2 mb-2"><DollarSign size={14}/> Chave PIX (Global)</label>
                            <div className="flex gap-2">
                                <input className="w-full max-w-md bg-neutral-900 border border-green-600/50 rounded p-3 text-white font-mono outline-none focus:border-green-500" placeholder="Email, CPF ou Telefone" value={pixKey} onChange={(e) => setPixKey(e.target.value)} />
                                <button onClick={() => fetch(`${API_URL}/api/settings/pix_key`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ value: pixKey }) }).then(() => showMessage("PIX Salvo!", "success"))} className="bg-green-700 hover:bg-green-600 text-white px-4 rounded font-bold transition">Salvar PIX</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // TELA DE EDIÇÃO DE PREÇOS DA ETAPA
                    <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-neutral-700 bg-neutral-900 flex justify-between items-center">
                            <div><h2 className="text-2xl font-black italic uppercase text-white flex items-center gap-2"><Tag className="text-yellow-500" /> Editando: {stages.find(s=>s.id===selectedStagePlan)?.name}</h2></div>
                            <button onClick={() => setSelectedStagePlan(null)} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm"><ArrowLeft size={16}/> Trocar Etapa</button>
                        </div>
                        
                        <div className="p-6 pb-8 mb-6 border-b border-neutral-700">
                            <label className="text-xs text-yellow-500 font-bold uppercase">Nome do Lote desta Etapa</label>
                            <input className="w-full bg-neutral-900 border border-yellow-600/50 rounded p-3 text-white font-bold text-lg outline-none focus:border-yellow-500 mt-2" placeholder="Ex: 1º Lote - Promocional" value={batchName} onChange={(e) => setBatchName(e.target.value)} />
                        </div>

                        <div className="px-6 pb-2"><h3 className="text-lg font-bold text-white mb-4">Tabela de Preços (Exclusivo desta Etapa)</h3></div>
                        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {localPlans.map(plan => (
                                <div key={plan.id} className="bg-[#111] border border-gray-800 rounded-xl p-6 relative hover:border-yellow-600/50 transition-all">
                                    <div className="mb-4 flex justify-between items-start">
                                        <div><h3 className="text-lg font-black text-white uppercase italic">{plan.name}</h3><p className="text-xs text-gray-500 mt-1">{plan.description}</p></div>
                                        <div className="bg-neutral-900 px-2 py-1 rounded text-[10px] font-bold text-gray-400 border border-neutral-800">{plan.limit_cat === 99 ? 'Ilimitado' : `${plan.limit_cat} Cat.`}</div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-neutral-900 p-3 rounded border border-neutral-700 focus-within:border-yellow-500 transition-colors"><span className="text-gray-400 text-sm font-bold">R$</span><input type="number" className="bg-transparent text-white font-black text-2xl w-full outline-none" value={plan.price} onChange={(e) => handleLocalPriceChange(plan.id, e.target.value)} /></div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-6 bg-neutral-900 border-t border-neutral-700 flex justify-end items-center gap-4">
                            <div className="text-xs text-gray-500 hidden md:block"><span className="text-yellow-500 font-bold">Atenção:</span> A alteração aplica somente a esta etapa.</div>
                            <button onClick={handleSaveStagePrices} disabled={loading} className="bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-4 rounded-lg font-black uppercase tracking-widest shadow-lg hover:shadow-yellow-900/20 transition-all flex items-center gap-3 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Salvando...' : 'Salvar Alterações'}{!loading && <Save size={20} strokeWidth={3} />}</button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* --- ABA PILOTOS (USUÁRIOS) COM BUSCA --- */}
        {activeTab === 'users' && (
          <div className="animate-fade-in space-y-6">
             {editingUser && (
                 <div className="bg-neutral-800 p-6 rounded-xl border-2 border-yellow-600/50 shadow-2xl mb-6 sticky top-24 z-40">
                     <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-yellow-500 flex items-center gap-2"><Edit3 size={20}/> Editando: {userForm.name}</h3><button onClick={handleCancelEditUser} className="text-gray-400 hover:text-white"><X size={24}/></button></div>
                     <form onSubmit={handleSaveUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         <div><label className="text-xs text-gray-500 font-bold uppercase">Nome</label><input className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} /></div>
                         <div><label className="text-xs text-gray-500 font-bold uppercase">Email</label><input className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} /></div>
                         <div><label className="text-xs text-gray-500 font-bold uppercase">Telefone</label><input className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} /></div>
                         <div><label className="text-xs text-gray-500 font-bold uppercase text-yellow-500">Nº Moto</label><input className="w-full bg-neutral-900 border border-yellow-900/50 rounded p-2 text-yellow-500 font-bold" value={userForm.bike_number} onChange={e => setUserForm({...userForm, bike_number: e.target.value})} /></div>
                         <div><label className="text-xs text-gray-500 font-bold uppercase text-blue-400">Chip ID</label><div className="relative"><input className="w-full bg-blue-900/10 border border-blue-900/50 rounded p-2 text-blue-400 font-mono font-bold" value={userForm.chip_id} onChange={e => setUserForm({...userForm, chip_id: e.target.value})} /><div className="absolute right-3 top-2.5 text-blue-500/50 text-xs">TAG</div></div></div>
                         <div><label className="text-xs text-gray-500 font-bold uppercase">Função</label><select className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}><option value="user">Piloto</option><option value="admin">Admin</option></select></div>
                         <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-2"><button type="button" onClick={handleCancelEditUser} className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-white font-bold text-sm">Cancelar</button><button type="submit" className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-bold text-sm uppercase flex items-center gap-2"><CheckCircle size={16}/> Salvar</button></div>
                     </form>
                 </div>
             )}
             <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-neutral-700 bg-neutral-900 flex justify-between items-center">
                   <h2 className="text-2xl font-black italic uppercase text-white flex items-center gap-2"><Users className="text-blue-500" /> Gestão de Pilotos</h2>
                   <div className="flex items-center gap-4">
                       <div className="relative hidden md:block">
                           <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                           <input 
                               type="text" 
                               placeholder="Buscar Piloto..." 
                               className="bg-neutral-800 border border-neutral-600 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:border-blue-500 outline-none w-64"
                               value={userSearch}
                               onChange={(e) => setUserSearch(e.target.value)}
                           />
                       </div>
                       <div className="text-sm text-gray-500 font-bold bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700">Total: {usersList.length}</div>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead><tr className="bg-neutral-900/50 text-gray-400 text-xs uppercase tracking-wider border-b border-neutral-700"><th className="p-4">Piloto</th><th className="p-4 text-center">Nº Moto</th><th className="p-4 text-center text-blue-400">Chip ID</th><th className="p-4 hidden md:table-cell">CPF</th><th className="p-4 text-center">Função</th><th className="p-4 text-right">Ações</th></tr></thead>
                      <tbody className="divide-y divide-neutral-700 text-sm text-gray-300">
                         {usersList.length > 0 ? (
                             usersList
                             .filter(u => 
                                u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                                u.email.toLowerCase().includes(userSearch.toLowerCase()) || 
                                (u.bike_number && u.bike_number.includes(userSearch))
                             )
                             .map((user) => (
                                <tr key={user.id} className={`hover:bg-neutral-700/30 transition group ${editingUser === user.id ? 'bg-yellow-900/10' : ''}`}>
                                    <td className="p-4 font-bold text-white capitalize">{user.name}<div className="text-xs text-gray-500 font-normal lowercase">{user.email}</div></td>
                                    <td className="p-4 text-center"><span className="font-mono font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">{user.bike_number||'-'}</span></td>
                                    <td className="p-4 text-center">{user.chip_id?(<span className="font-mono text-xs text-blue-400 border border-blue-900 bg-blue-900/20 px-2 py-1 rounded">{user.chip_id}</span>):(<span className="text-xs text-gray-600 italic">--</span>)}</td>
                                    <td className="p-4 text-gray-500 font-mono text-xs hidden md:table-cell">{user.cpf}</td>
                                    <td className="p-4 text-center">{user.role==='admin'?(<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/20 text-red-500 border border-red-900/50">ADMIN</span>):(<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-700 text-gray-400">PILOTO</span>)}</td>
                                    <td className="p-4 text-right flex justify-end gap-2"><button onClick={() => handleEditUserClick(user)} className="p-2 rounded text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10"><Edit3 size={16}/></button><button onClick={() => handleDeleteUser(user.id)} className="p-2 rounded text-gray-400 hover:text-red-500 hover:bg-red-500/10"><Trash2 size={16}/></button></td>
                                </tr>
                             ))
                         ) : (<tr><td colSpan="6" className="p-12 text-center text-gray-500 italic">{loading?"...":"Nenhum piloto."}</td></tr>)}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;