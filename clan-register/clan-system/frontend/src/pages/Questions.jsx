import { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [editing, setEditing] = useState(null);
  const { isAdmin } = useAuth();

  const load = () => api.get('/questions').then(r => setQuestions(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (q) => {
    if (q.id) await api.put(`/questions/${q.id}`, q);
    else await api.post('/questions', q);
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Remover pergunta?')) return;
    await api.delete(`/questions/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Perguntas do Registro</h1>
          <p className="text-dark-400">Configure as perguntas do formulário de registro</p>
        </div>
        {isAdmin && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setEditing({ label: '', field_key: '', placeholder: '', required: true })}>
            <Plus size={18} /> Adicionar
          </button>
        )}
      </div>

      <div className="card divide-y divide-dark-800">
        {questions.map((q, i) => (
          <div key={q.id} className="p-4 flex items-center justify-between hover:bg-dark-800/30">
            <div>
              <p className="font-medium">{i + 1}. {q.label} {q.required ? <span className="text-red-400 text-xs">*</span> : null}</p>
              <p className="text-xs text-dark-400">Chave: <code className="bg-dark-700 px-1 rounded">{q.field_key}</code> • Tipo: {q.type}</p>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button onClick={() => setEditing(q)} className="text-primary-400 hover:text-primary-300 text-sm">Editar</button>
                <button onClick={() => remove(q.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold">{editing.id ? 'Editar' : 'Nova'} Pergunta</h2>
            <input className="input w-full" placeholder="Label (ex: 👤 Nome)" value={editing.label} onChange={e => setEditing({...editing, label: e.target.value})} />
            <input className="input w-full" placeholder="Chave (ex: name)" value={editing.field_key} onChange={e => setEditing({...editing, field_key: e.target.value})} />
            <input className="input w-full" placeholder="Placeholder" value={editing.placeholder || ''} onChange={e => setEditing({...editing, placeholder: e.target.value})} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!editing.required} onChange={e => setEditing({...editing, required: e.target.checked})} />
              Obrigatória
            </label>
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
