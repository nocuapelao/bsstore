import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Hierarchy from './pages/Hierarchy';
import Registrations from './pages/Registrations';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import Questions from './pages/Questions';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="hierarchy" element={<Hierarchy />} />
        <Route path="registrations" element={<Registrations />} />
        <Route path="logs" element={<Logs />} />
        <Route path="questions" element={<Questions />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
