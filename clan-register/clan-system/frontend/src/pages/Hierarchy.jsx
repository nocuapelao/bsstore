import { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Hierarchy() {
  const [ranks, setRanks] = useState([]);
  const [editing, setEditing] = useState(null);
  const { isAdmin } = useAuth();

  const load = () => api.get('/hierarchy').then(r => setRanks(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (rank) => {
    if (rank.id) {
      await api.put(`/hierarchy/${rank.id}`, rank);
    } else {
      await api.post('/hierarchy', rank);
    }
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Remover este cargo da hierarquia?')) return;
    await api.delete(`/hierarchy/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hierarquia</h1>
          <p className="text-dark-400">Gerencie os cargos e permissões do clã</p>
        </div>
        {isAdmin && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setEditing({ name: '', emoji: '🔰', position: ranks.length, can_set: false, can_approve: false })}>
            <Plus size={18} /> Adicionar
          </button>
        )}
      </div>

      {/* Visual hierarchy */}
      <div className="card p-6">
        <div className="flex flex-col items-center gap-1">
          {ranks.map((r, i) => (
            <div key={r.id} className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 border border-primary-900/30">
                <span className="text-xl">{r.emoji}</span>
                <span className="font-semibold">{r.name}</span>
              </div>
              {i < ranks.length - 1 && <div className="text-primary-500 text-lg my-1">↓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-700 text-dark-400">
              <th className="text-left p-4">Pos</th>
              <th className="text-left p-4">Cargo</th>
              <th className="text-left p-4">Role ID</th>
              <th className="text-left p-4">Permissões</th>
              {isAdmin && <th className="text-right p-4">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {ranks.map(r => (
              <tr key={r.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                <td className="p-4">{r.position}</td>
                <td className="p-4 font-medium">{r.emoji} {r.name}</td>
                <td className="p-4 text-dark-400 font-mono text-xs">{r.role_id || '—'}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {r.can_approve ? <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Aprovar</span> : null}
                    {r.can_set ? <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Set</span> : null}
                    {r.can_remove_set ? <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Remover</span> : null}
                    {r.can_view_logs ? <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">Logs</span> : null}
                    {r.can_config ? <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">Config</span> : null}
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-4 text-right">
                    <button onClick={() => setEditing(r)} className="text-primary-400 hover:text-primary-300 mr-2">Editar</button>
                    <button onClick={() => remove(r.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold">{editing.id ? 'Editar' : 'Novo'} Cargo</h2>
            <input className="input w-full" placeholder="Nome" value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} />
            <input className="input w-full" placeholder="Emoji" value={editing.emoji || ''} onChange={e => setEditing({...editing, emoji: e.target.value})} />
            <input className="input w-full" placeholder="Role ID Discord" value={editing.role_id || ''} onChange={e => setEditing({...editing, role_id: e.target.value})} />
            <input className="input w-full" type="number" placeholder="Posição" value={editing.position ?? 0} onChange={e => setEditing({...editing, position: parseInt(e.target.value)})} />
            <div className="grid grid-cols-2 gap-2 text-sm">
              {['can_approve', 'can_set', 'can_remove_set', 'can_view_logs', 'can_manage_members', 'can_config'].map(k => (
                <label key={k} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!editing[k]} onChange={e => setEditing({...editing, [k]: e.target.checked})} className="rounded" />
                  {k.replace('can_', '').replace('_', ' ')}
                </label>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn-primary flex items-center gap-2" onClick={() => save(editing)}><Save size={16} /> Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
