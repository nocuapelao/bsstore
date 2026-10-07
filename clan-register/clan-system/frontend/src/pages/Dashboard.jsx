import { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, ClipboardList, UserCheck, Award, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState({});

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/config').then(r => setConfig(r.data)).catch(() => {});
  }, []);

  if (!stats) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  const cards = [
    { label: 'Membros', value: stats.members, icon: Users, color: 'from-blue-500 to-blue-700' },
    { label: 'Registros', value: stats.totalRegistrations, icon: ClipboardList, color: 'from-purple-500 to-purple-700' },
    { label: 'Ativos', value: stats.members, icon: UserCheck, color: 'from-green-500 to-green-700' },
    { label: 'Pendentes', value: stats.pending, icon: TrendingUp, color: 'from-yellow-500 to-yellow-700' },
    { label: 'Sets Realizados', value: stats.sets, icon: Award, color: 'from-pink-500 to-pink-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {config.emoji || '🏆'} {config.clan_name || 'Dashboard'}
        </h1>
        <p className="text-dark-400 mt-1">Visão geral do clã</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="card p-5 relative overflow-hidden group hover:border-primary-500/50 transition-all">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${c.color} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-sm">{c.label}</p>
                <p className="text-3xl font-bold mt-1">{c.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${c.color} shadow-glow-sm`}>
                <c.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-primary-400" /> Últimos Registros
          </h2>
          <div className="space-y-3">
            {stats.recentRegistrations?.length > 0 ? stats.recentRegistrations.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                <div>
                  <p className="font-medium">{r.discord_username}</p>
                  <p className="text-xs text-dark-400">{r.created_at}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  r.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  r.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {r.status}
                </span>
              </div>
            )) : <p className="text-dark-400 text-sm">Nenhum registro recente</p>}
          </div>
        </div>

        {/* Recent Sets */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Award size={18} className="text-primary-400" /> Últimos Sets
          </h2>
          <div className="space-y-3">
            {stats.recentSets?.length > 0 ? stats.recentSets.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                <div>
                  <p className="font-medium">{s.member_name || s.member_discord_id}</p>
                  <p className="text-xs text-dark-400">{s.created_at}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-300">
                  {s.rank_name || s.action}
                </span>
              </div>
            )) : <p className="text-dark-400 text-sm">Nenhum set recente</p>}
          </div>
        </div>
      </div>

      {/* Hierarchy distribution */}
      {stats.byHierarchy?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Distribuição por Hierarquia</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {stats.byHierarchy.map((h, i) => (
              <div key={i} className="text-center p-3 rounded-lg bg-dark-800/50">
                <div className="text-2xl mb-1">{h.emoji || '•'}</div>
                <p className="text-sm font-medium truncate">{h.name}</p>
                <p className="text-xl font-bold text-primary-400">{h.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
