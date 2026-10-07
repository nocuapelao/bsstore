import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Crown, ClipboardList, 
  ScrollText, Settings, HelpCircle, LogOut, Menu, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [config, setConfig] = useState({});

  useEffect(() => {
    api.get('/config').then(r => setConfig(r.data)).catch(() => {});
  }, []);

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/members', icon: Users, label: 'Membros' },
    { to: '/hierarchy', icon: Crown, label: 'Hierarquia' },
    { to: '/registrations', icon: ClipboardList, label: 'Registros' },
    { to: '/questions', icon: HelpCircle, label: 'Perguntas' },
    { to: '/logs', icon: ScrollText, label: 'Logs' },
    { to: '/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-900/95 backdrop-blur border-r border-primary-900/30 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-primary-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xl shadow-glow">
              {config.emoji || '🏆'}
            </div>
            <div>
              <h1 className="font-bold text-lg truncate">{config.clan_name || 'Clan Panel'}</h1>
              <p className="text-xs text-dark-400">Painel de Gestão</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-900/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
              {user?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-dark-400">{user?.isAdmin ? 'Admin' : 'Membro'}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2 text-dark-400 hover:text-red-400 text-sm transition-colors">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur border-b border-primary-900/30 px-4 py-3 flex items-center gap-4">
          <button className="lg:hidden text-dark-300 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-dark-400">
            Sistema de Clã FiveM
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
