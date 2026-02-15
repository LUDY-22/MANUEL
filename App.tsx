
import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { User, UserRole } from './types';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Damage from './pages/Damage';
import Settings from './pages/Settings';
import { LockClosedIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setPage] = useState('dashboard');
  const [loginError, setLoginError] = useState('');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = db.getUsers();
    const foundUser = users.find(u => u.username === username);
    
    // Verificação de senha real (offline)
    if (foundUser && foundUser.password === password) {
      setUser(foundUser);
      setLoginError('');
    } else if (foundUser && foundUser.password !== password) {
      setLoginError('Senha incorreta.');
    } else {
      setLoginError('Usuário não encontrado.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPage('dashboard');
    setUsername('');
    setPassword('');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-12">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-teal-500 rounded-3xl flex items-center justify-center shadow-xl shadow-teal-500/30 mb-6">
              <span className="text-4xl font-black text-white">L</span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">LUVIEL Fluxo</h1>
            <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-widest">Gestão Offline Profissional</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Utilizador</label>
              <input 
                type="text" 
                required 
                placeholder="Ex: admin ou vendedor"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Palavra-passe</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            
            {loginError && <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">{loginError}</p>}
            
            <button 
              type="submit" 
              className="w-full py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <LockClosedIcon className="w-5 h-5" />
              Entrar no Sistema
            </button>
          </form>

          <div className="mt-8 text-center text-slate-400 text-xs">
            <p>Admin: admin / 123</p>
            <p>Vendedor: vendedor / 123</p>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[10px] text-slate-300 uppercase font-bold tracking-[0.2em]">Luanda, Angola &copy; 2024</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout} currentPage={currentPage} setPage={setPage}>
      {currentPage === 'dashboard' && <Dashboard user={user} />}
      {currentPage === 'sales' && <Sales user={user} />}
      {currentPage === 'inventory' && <Inventory user={user} />}
      {currentPage === 'reports' && <Reports user={user} />}
      {currentPage === 'damages' && <Damage user={user} />}
      {currentPage === 'settings' && <Settings user={user} onUpdateUser={handleUpdateUser} />}
    </Layout>
  );
};

export default App;
