import { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Members() {
  const [data, setData] = useState({ members: [], total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/members', { params: { page, search, limit: 15 } })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Membros</h1>
          <p className="text-dark-400">Total: {data.total} membros</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              className="input pl-9 w-64"
              placeholder="Buscar membro..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">Buscar</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700 text-dark-400">
                <th className="text-left p-4">Membro</th>
                <th className="text-left p-4">ID FiveM</th>
                <th className="text-left p-4">Nick</th>
                <th className="text-left p-4">Cargo</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Registrado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-dark-400">Carregando...</td></tr>
              ) : data.members.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-dark-400">Nenhum membro encontrado</td></tr>
              ) : data.members.map(m => (
                <tr key={m.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{m.name || m.discord_username}</div>
                    <div className="text-xs text-dark-400">{m.discord_id}</div>
                  </td>
                  <td className="p-4">{m.fivem_id || '—'}</td>
                  <td className="p-4">{m.fivem_nick || '—'}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1">
                      {m.hierarchy_emoji} {m.hierarchy_name || 'Sem cargo'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${m.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-dark-600 text-dark-300'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="p-4 text-dark-400">{m.registered_at?.substring(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-dark-700">
            <p className="text-sm text-dark-400">Página {data.page} de {data.totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary p-2 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary p-2 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
