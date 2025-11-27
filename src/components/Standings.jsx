import { useState, useEffect } from "react";
import { Trophy, Search, Filter, Calendar } from "lucide-react";

const Standings = () => {
  const categoriesList = [
    "50cc", "65cc", "Feminino", "Free Force One", "Importada Amador",
    "Junior", "Nacional Amador", "Open Importada", "Open Nacional",
    "Over 250", "Ultimate 250x230", "VX 250f Nacional", "VX230",
    "VX3 Importada", "VX3 Nacional", "VX4", "VX5", "VX6", "VX7",
    "Trilheiros Nacional", "Trilheiros Importada"
  ];

  const [activeCategory, setActiveCategory] = useState(categoriesList[0]);
  const [rankings, setRankings] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stages, setStages] = useState([]);
  const [viewMode, setViewMode] = useState('overall');

  useEffect(() => {
    fetch('http://localhost:3000/api/stages')
      .then(res => res.json())
      .then(data => setStages(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = viewMode === 'overall' 
      ? 'http://localhost:3000/api/standings/overall'
      : `http://localhost:3000/api/stages/${viewMode}/standings`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const grouped = {};
        categoriesList.forEach(cat => grouped[cat] = []);
        data.forEach(record => {
          const catKey = categoriesList.find(c => c.toLowerCase() === record.category.trim().toLowerCase()) || record.category;
          if (!grouped[catKey]) grouped[catKey] = [];
          grouped[catKey].push({
            name: record.pilot_name,
            number: record.pilot_number,
            points: record.total_points
          });
        });
        setRankings(grouped);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, [viewMode]);

  const currentList = rankings[activeCategory] || [];
  const filteredPilots = currentList.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.number.includes(searchTerm)
  );

  return (
    <div className="w-full bg-[#111] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
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
      <div className="bg-[#151515] border-b border-gray-800 p-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max px-2">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all skew-x-[-10deg] ${activeCategory === cat ? 'bg-[#D80000] text-white shadow-[0_0_15px_rgba(216,0,0,0.4)]' : 'bg-[#222] text-gray-500 hover:text-white hover:bg-[#333]'}`}
            >
              <span className="skew-x-[10deg] inline-block">{cat}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-[300px] bg-[#0a0a0a]">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-500">Calculando...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#111] text-gray-500 text-xs uppercase font-bold tracking-widest sticky top-0">
              <tr>
                <th className="p-4 text-center w-20">Pos</th>
                <th className="p-4 text-center w-24">Nº Moto</th>
                <th className="p-4">Piloto</th>
                <th className="p-4 text-center w-24 text-[#D80000] bg-[#D80000]/5">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {filteredPilots.length > 0 ? (
                filteredPilots.map((pilot, idx) => (
                  <tr key={idx} className="hover:bg-[#1f1f1f] transition-colors group">
                    <td className="p-4 text-center font-bold text-gray-400 group-hover:text-white">{idx + 1}º</td>
                    <td className="p-4 text-center"><span className="font-mono font-bold text-[#D80000] bg-[#1a1a1a] px-2 py-1 rounded border border-gray-800">{pilot.number}</span></td>
                    <td className="p-4 font-bold text-gray-200 group-hover:text-white uppercase">{pilot.name}</td>
                    <td className="p-4 text-center font-black text-xl text-white bg-[#D80000]/5 group-hover:bg-[#D80000]/10">{pilot.points}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="p-16 text-center text-gray-600 italic">Nenhuma pontuação.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Standings;