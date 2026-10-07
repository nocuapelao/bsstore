import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Registrations() {
  const [data, setData] = useState({ registrations: [], total: 0 });
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.get('/registrations', { params: { status, limit: 30 } })
      .then(r => setData(r.data))
      .catch(() => {});
  }, [status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Registros</h1>
          <p className="text-dark-400">Total: {data.total}</p>
        </div>
        <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovados</option>
          <option value="rejected">Recusados</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-700 text-dark-400">
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Usuário</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Data</th>
              <th className="text-left p-4">Revisado por</th>
            </tr>
          </thead>
          <tbody>
            {data.registrations.map(r => (
              <tr key={r.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                <td className="p-4 font-mono">#{r.id}</td>
                <td className="p-4">{r.discord_username}<br/><span className="text-xs text-dark-400">{r.discord_id}</span></td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    r.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    r.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{r.status}</span>
                </td>
                <td className="p-4 text-dark-400">{r.created_at?.substring(0, 16)}</td>
                <td className="p-4 text-dark-400">{r.reviewed_by || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
