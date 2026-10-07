import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Logs() {
  const [data, setData] = useState({ logs: [], total: 0 });
  const [type, setType] = useState('');

  useEffect(() => {
    api.get('/logs', { params: { type, limit: 50 } })
      .then(r => setData(r.data))
      .catch(() => {});
  }, [type]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Logs</h1>
          <p className="text-dark-400">Histórico de ações do sistema</p>
        </div>
        <select className="input" value={type} onChange={e => setType(e.target.value)}>
          <option value="">Todos</option>
          <option value="registration">Registros</option>
          <option value="approval">Aprovações</option>
          <option value="rejection">Recusas</option>
          <option value="set">Sets</option>
          <option value="remove_set">Remoções</option>
          <option value="config">Configurações</option>
        </select>
      </div>

      <div className="card p-4 space-y-2 max-h-[70vh] overflow-y-auto">
        {data.logs.length === 0 ? (
          <p className="text-dark-400 text-center py-8">Nenhum log encontrado</p>
        ) : data.logs.map(l => (
          <div key={l.id} className="flex items-start gap-3 p-3 rounded-lg bg-dark-800/40 hover:bg-dark-800/70 transition-colors">
            <span className="text-xs font-mono text-dark-500 whitespace-nowrap pt-0.5">{l.created_at?.substring(0, 16)}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              l.type === 'approval' || l.type === 'set' ? 'bg-green-500/20 text-green-400' :
              l.type === 'rejection' || l.type === 'remove_set' ? 'bg-red-500/20 text-red-400' :
              l.type === 'config' ? 'bg-blue-500/20 text-blue-400' :
              'bg-primary-500/20 text-primary-300'
            }`}>{l.type}</span>
            <p className="text-sm flex-1">{l.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
