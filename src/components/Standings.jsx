import { useState, useEffect } from "react";
import { Trophy, Search, Filter } from "lucide-react";
import API_URL from "../api";

const Standings = () => {
  // --- ESTADOS ---
  const [categoriesList, setCategoriesList] = useState([]); // Agora inicia vazio e preenche via API
  const [activeCategory, setActiveCategory] = useState(""); // Categoria ativa
  const [rankings, setRankings] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stages, setStages] = useState([]);
  const [viewMode, setViewMode] = useState('overall');

  // 1. Busca Categorias Dinâmicas (Igual ao Admin)
  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        // Extrai apenas os nomes das categorias
        const names = data.map(c => c.name);
        setCategoriesList(names);
        
        // Se houver categorias, define a primeira como ativa por padrão
        if (names.length > 0) {
          setActiveCategory(names[0]);
        }
      })
      .catch(err => console.error("Erro ao buscar categorias:", err));
  }, []);

  // 2. Busca lista de etapas
  useEffect(() => {
    fetch(`${API_URL}/api/stages`)
      .then(res => res.json())
      .then(data => setStages(data))
      .catch(err => console.error(err));
  }, []);

  // 3. Busca dados do ranking (Geral ou Etapa)
  // Adicionamos 'categoriesList' nas dependências para recalcular se as categorias mudarem
  useEffect(() => {
    if (categoriesList.length === 0) return; // Aguarda carregar categorias primeiro

    setLoading(true);
    const url = viewMode === 'overall' 
      ? `${API_URL}/api/standings/overall`
      : `${API_URL}/api/stages/${viewMode}/standings`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const grouped = {};
        
        // Inicializa o objeto com as chaves das categorias vindas do banco
        categoriesList.forEach(cat => grouped[cat] = []);
        
        data.forEach(record => {
          // Tenta casar o nome da categoria vindo do resultado com a lista (case insensitive)
          const catKey = categoriesList.find(c => c.toLowerCase() === record.category.trim().toLowerCase()) || record.category;
          
          if (!grouped[catKey]) grouped[catKey] = [];
          
          // Armazena todos os dados necessários
          grouped[catKey].push({
            pos: record.position, 
            name: record.pilot_name,
            number: record.pilot_number,
            points: record.points || record.total_points,
            // Dados detalhados da corrida
            laps: record.laps,
            total_time: record.total_time,
            diff_first: record.diff_first,
            best_lap: record.best_lap
          });
        });
        setRankings(grouped);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, [viewMode, categoriesList]);

  const currentList = rankings[activeCategory] || [];
  const filteredPilots = currentList.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.number && p.number.toString().includes(searchTerm))
  );

  return (
    <div className="w-full bg-[#111] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
      {/* HEADER */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border-b border-gray-800">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black italic uppercase flex items-center gap-3 text-white">
                <Trophy className="text-[#D80000]" size={32} />
                {viewMode === 'overall' ? 'Ranking Geral' : 'Resultado da Etapa'}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {viewMode === 'overall' ? 'Soma de todas as etapas' : stages.find(s => s.id == viewMode)?.name}
              </p>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Filter size={16} className="text-[#D80000]" />
              </div>
              <select 
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="appearance-none bg-[#0a0a0a] border border-gray-700 text-white py-3 pl-10 pr-10 rounded-lg font-bold uppercase text-sm focus:border-[#D80000] focus:outline-none cursor-pointer hover:border-gray-500 transition min-w-[200px]"
              >
                <option value="overall">🏆 Campeonato Completo</option>
                <optgroup label="Etapas Individuais">
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>📍 {stage.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar piloto..." 
              className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-[#D80000] outline-none transition"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SELETOR DE CATEGORIAS */}
      <div className="bg-[#151515] border-b border-gray-800 p-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max px-2">
          {categoriesList.length > 0 ? (
            categoriesList.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all skew-x-[-10deg] ${activeCategory === cat ? 'bg-[#D80000] text-white shadow-[0_0_15px_rgba(216,0,0,0.4)]' : 'bg-[#222] text-gray-500 hover:text-white hover:bg-[#333]'}`}
              >
                <span className="skew-x-[10deg] inline-block">{cat}</span>
              </button>
            ))
          ) : (
            <div className="px-5 py-2 text-xs text-gray-500 italic">Carregando categorias...</div>
          )}
        </div>
      </div>

      {/* TABELA DE RESULTADOS */}
      <div className="min-h-[300px] bg-[#0a0a0a] overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-500">Calculando...</div>
        ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap">
            {/* CABEÇALHO */}
            <thead className="bg-[#111] text-gray-500 text-xs uppercase font-bold tracking-widest sticky top-0 border-b border-gray-800">
              <tr>
                <th className="p-4 text-center w-20">Pos</th>
                <th className="p-4 text-left">Piloto</th>
                <th className="p-4 text-center w-24">Nº</th>
                
                {/* Colunas extras só aparecem na visão de Etapa */}
                {viewMode !== 'overall' && (
                  <>
                    <th className="p-4 text-center">Voltas</th>
                    <th className="p-4 text-left">Tempo Total</th>
                    <th className="p-4 text-left">Dif. Líder</th>
                    <th className="p-4 text-left">Melhor Volta</th>
                  </>
                )}

                <th className="p-4 text-center w-24 text-[#D80000] bg-[#D80000]/5">PTS</th>
              </tr>
            </thead>
            
            {/* CORPO DA TABELA */}
            <tbody className="divide-y divide-gray-800 text-sm">
              {filteredPilots.length > 0 ? (
                filteredPilots.map((pilot, idx) => (
                  <tr key={idx} className="hover:bg-[#1f1f1f] transition-colors group">
                    {/* Pos */}
                    <td className="p-4 text-center font-bold text-gray-400 group-hover:text-white">
                      {viewMode !== 'overall' && pilot.pos ? `${pilot.pos}º` : `${idx + 1}º`}
                    </td>
                    
                    {/* Piloto */}
                    <td className="p-4 font-bold text-gray-200 group-hover:text-white uppercase text-left">
                      {pilot.name}
                    </td>

                    {/* Nº */}
                    <td className="p-4 text-center">
                      <span className="font-mono font-bold text-yellow-500">
                        {pilot.number}
                      </span>
                    </td>

                    {/* Dados Extras */}
                    {viewMode !== 'overall' && (
                      <>
                        <td className="p-4 text-center text-gray-400">
                            {pilot.laps}
                        </td>
                        <td className="p-4 text-left text-gray-400 text-xs">
                            {pilot.total_time}
                        </td>
                        <td className="p-4 text-left text-gray-500 text-xs">
                            {pilot.diff_first}
                        </td>
                        <td className="p-4 text-left text-green-400 text-xs font-mono">
                            {pilot.best_lap}
                        </td>
                      </>
                    )}

                    {/* PTS */}
                    <td className="p-4 text-center font-black text-xl text-[#D80000] bg-[#D80000]/5 group-hover:bg-[#D80000]/10">
                      {pilot.points}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={viewMode !== 'overall' ? "8" : "4"} className="p-16 text-center text-gray-600 italic">
                    Nenhuma pontuação encontrada para esta categoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Standings;