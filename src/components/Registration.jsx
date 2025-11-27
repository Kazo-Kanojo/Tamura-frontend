import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Trophy, Bike } from 'lucide-react';
import Navbar from './Navbar';
import API_URL from '../api'; // Importação da API

const CATEGORIES = [
  "50cc", "65cc", "Feminino", "Free Force One", "Importada Amador", 
  "Junior", "Nacional Amador", "Open Importada", "Open Nacional", 
  "Over 250", "Ultimate 250x230", "VX 250f Nacional", "VX230", 
  "VX3 Importada", "VX3 Nacional", "VX4", "VX5", "VX6", "VX7",
  "Trilheiros Nacional", "Trilheiros Importada"
];

const Registration = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [plans, setPlans] = useState([]); 
  const [batchName, setBatchName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  // Helper de Token
  const getAuthHeader = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` });

  useEffect(() => {
    if (!user) {
        alert("Você precisa estar logado para realizar a inscrição.");
        navigate('/login');
        return;
    }

    // Buscar Etapas
    fetch(`${API_URL}/api/stages`)
      .then(res => res.json())
      .then(stages => {
        const currentStage = stages.find(s => s.id == id);
        if (currentStage) {
          setEvent(currentStage);
        } else {
          alert("Evento não encontrado!");
          navigate('/dashboard');
        }
      })
      .catch(err => console.error("Erro ao carregar etapas:", err));

    // Buscar Preços Específicos da Etapa
    fetch(`${API_URL}/api/stages/${id}/prices`)
      .then(res => res.json())
      .then(data => {
          setPlans(data.plans);
          setBatchName(data.batch_name);
      })
      .catch(err => console.error("Erro ao carregar planos:", err));

  }, [id, navigate, user]);

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      if (!selectedPlan) return alert("Selecione um pacote de preço primeiro!");
      if (selectedPlan.limit_cat !== 99 && selectedCategories.length >= selectedPlan.limit_cat) {
        return alert(`O plano "${selectedPlan.name}" permite apenas ${selectedPlan.limit_cat} categorias.`);
      }
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setSelectedCategories([]); 
  };

  const handleFinishRegistration = async () => {
    if (!selectedPlan || selectedCategories.length === 0) return;
    if (!user) return alert("Você precisa estar logado!");

    setLoading(true);

    const registrationData = {
      user_id: user.id,
      pilot_name: user.name,
      pilot_number: user.bike_number || '00',
      stage_id: id,
      plan_name: selectedPlan.name,
      categories: selectedCategories,
      total_price: selectedPlan.price
    };

    try {
      const response = await fetch(`${API_URL}/api/registrations`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(registrationData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Inscrição Realizada com Sucesso!\nValor a Pagar: R$ ${selectedPlan.price},00`);
        navigate('/dashboard'); 
      } else {
        alert("Erro: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!event || !user || plans.length === 0) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#D80000] selection:text-white pb-40">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6 pt-12">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-400 hover:text-white mb-8 transition"><ArrowLeft size={20} className="mr-2"/> Cancelar Inscrição</button>
        
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-800 pb-6 mb-10 gap-4">
          <div>
            <span className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-2 block">{batchName || 'Inscrições Abertas'}</span>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Inscrição <span className="text-[#D80000]">Confirmada</span></h1>
            <div className="flex items-center gap-3 mt-2 text-gray-300 text-lg">
              <Trophy size={20} className="text-[#D80000]" />
              <span className="font-bold">{event.name}</span>
              <span className="text-gray-600">|</span>
              <span>{event.location}</span>
              <span className="text-gray-600">|</span>
              <span>{new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <div className="text-right">
             <p className="text-gray-500 text-xs uppercase font-bold">Piloto</p>
             <p className="text-xl font-bold">{user.name} <span className="text-[#D80000]">#{user.bike_number}</span></p>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 text-gray-200 flex items-center gap-2"><span className="bg-[#D80000] w-6 h-6 rounded text-xs flex items-center justify-center text-black font-bold">1</span> Escolha seu Pacote</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <button key={plan.id} onClick={() => handleSelectPlan(plan)} className={`relative p-6 rounded-xl border-2 text-left transition-all duration-200 group ${selectedPlan?.id === plan.id ? 'border-[#D80000] bg-[#D80000]/10 shadow-[0_0_20px_rgba(216,0,0,0.2)]' : 'border-gray-800 bg-[#111] hover:border-gray-600'}`}>
                {selectedPlan?.id === plan.id && <div className="absolute top-4 right-4 text-[#D80000]"><Check size={20} /></div>}
                <h3 className="text-lg font-black uppercase italic tracking-wide text-white">{plan.name}</h3>
                <div className="text-3xl font-black text-[#D80000] mt-2 mb-2"><span className="text-sm font-medium text-gray-500 mr-1">R$</span>{plan.price},00</div>
                <p className="text-xs text-gray-500">{plan.description}</p>
              </button>
            ))}
          </div>
        </section>

        {selectedPlan && (
          <section className="mb-8 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2"><span className="bg-[#D80000] w-6 h-6 rounded text-xs flex items-center justify-center text-black font-bold">2</span> Selecione as Categorias</h2>
              <span className={`text-xs font-bold px-3 py-1 rounded border ${selectedCategories.length === selectedPlan.limit_cat ? 'bg-green-900/30 text-green-400 border-green-600' : 'bg-gray-800 text-gray-300 border-gray-700'}`}>{selectedCategories.length} de {selectedPlan.limit_cat === 99 ? 'Todas' : selectedPlan.limit_cat} selecionadas</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => {
                if (selectedPlan.allowed && !selectedPlan.allowed.includes(cat)) return null;
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button key={cat} onClick={() => toggleCategory(cat)} className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all flex justify-between items-center ${isSelected ? 'bg-white text-black border-white shadow-lg scale-[1.02]' : 'bg-[#111] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'}`}>
                    {cat}
                    {isSelected && <Bike size={14} className="text-[#D80000]" />}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-[#0f0f0f] border-t border-gray-800 p-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex flex-col"><span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total a Pagar</span><div className="text-3xl font-black text-white flex items-baseline gap-1"><span className="text-sm font-medium text-[#D80000]">R$</span>{selectedPlan ? selectedPlan.price : '0'},00</div></div>
          <button onClick={handleFinishRegistration} disabled={loading || !selectedPlan || selectedCategories.length === 0} className={`flex items-center gap-3 px-6 md:px-10 py-3 md:py-4 rounded font-black uppercase tracking-widest transition-all text-sm md:text-base ${(!selectedPlan || selectedCategories.length === 0) ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[#D80000] hover:bg-red-700 text-white shadow-lg hover:shadow-red-900/20 hover:-translate-y-1'}`}>{loading ? 'Processando...' : 'Confirmar Inscrição'}{!loading && <Check size={20} strokeWidth={3} />}</button>
        </div>
      </div>
    </div>
  );
};

export default Registration;