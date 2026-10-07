import { useEffect, useState } from 'react';
import api from '../services/api';
import { Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const [config, setConfig] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    api.get('/config').then(r => setConfig(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    if (!isAdmin) return;
    setSaving(true);
    try {
      const { data } = await api.put('/config', config);
      setConfig(data);
      setMsg('Salvo com sucesso!');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Erro ao salvar');
    }
    setSaving(false);
  };

  const fields = [
    { key: 'clan_name', label: 'Nome do Clã', type: 'text' },
    { key: 'emoji', label: 'Emoji', type: 'text' },
    { key: 'primary_color', label: 'Cor Principal (HEX)', type: 'text' },
    { key: 'secondary_color', label: 'Cor Secundária (HEX)', type: 'text' },
    { key: 'logo_url', label: 'URL da Logo', type: 'text' },
    { key: 'banner_url', label: 'URL do Banner', type: 'text' },
    { key: 'thumbnail_url', label: 'URL da Thumbnail', type: 'text' },
    { key: 'panel_channel_id', label: 'ID Canal do Painel', type: 'text' },
    { key: 'register_channel_id', label: 'ID Canal de Registros', type: 'text' },
    { key: 'logs_channel_id', label: 'ID Canal de Logs', type: 'text' },
    { key: 'approval_channel_id', label: 'ID Canal de Aprovação', type: 'text' },
    { key: 'member_role_id', label: 'ID Cargo de Membro', type: 'text' },
    { key: 'panel_title', label: 'Título do Painel', type: 'text' },
    { key: 'panel_description', label: 'Descrição do Painel', type: 'textarea' },
    { key: 'welcome_message', label: 'Mensagem de Boas-vindas', type: 'textarea' },
    { key: 'register_button_label', label: 'Texto do Botão de Registro', type: 'text' },
    { key: 'footer_text', label: 'Footer', type: 'text' },
  ];

  if (!isAdmin) {
    return <div className="card p-8 text-center text-dark-400">Apenas administradores podem editar as configurações.</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-dark-400">Personalize o sistema do clã</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={save} disabled={saving}>
          <Save size={18} /> {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {msg && <div className="p-3 rounded-lg bg-green-500/20 text-green-400 text-sm">{msg}</div>}

      <div className="card p-6 space-y-4">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-sm text-dark-300 mb-1">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                className="input w-full min-h-[80px]"
                value={config[f.key] || ''}
                onChange={e => setConfig({...config, [f.key]: e.target.value})}
              />
            ) : (
              <input
                className="input w-full"
                value={config[f.key] || ''}
                onChange={e => setConfig({...config, [f.key]: e.target.value})}
              />
            )}
          </div>
        ))}

        <div className="flex items-center gap-4 pt-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!!config.approval_enabled}
              onChange={e => setConfig({...config, approval_enabled: e.target.checked ? 1 : 0})}
            />
            Sistema de aprovação ativado
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!!config.set_remove_previous}
              onChange={e => setConfig({...config, set_remove_previous: e.target.checked ? 1 : 0})}
            />
            Remover cargo anterior no set
          </label>
        </div>
      </div>
    </div>
  );
}
