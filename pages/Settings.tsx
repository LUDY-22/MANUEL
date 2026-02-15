
import React, { useState } from 'react';
import { db } from '../services/db';
import { User } from '../types';
import { UserCircleIcon, KeyIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Settings: React.FC<{ user: User, onUpdateUser: (u: User) => void }> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      setMessage('As senhas não coincidem.');
      setIsError(true);
      return;
    }

    const updatedUser: User = {
      ...user,
      name: name,
    };
    
    if (password) {
      updatedUser.password = password;
    }

    const success = db.updateUser(updatedUser);
    if (success) {
      onUpdateUser(updatedUser);
      setMessage('Perfil atualizado com sucesso!');
      setIsError(false);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Erro ao atualizar perfil.');
      setIsError(true);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Configurações de Perfil</h2>
        <p className="text-slate-500">Altere seu nome de exibição e credenciais de acesso.</p>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-8">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-4">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center">
              <UserCircleIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{user.username}</p>
              <p className="text-xs text-slate-400 uppercase tracking-widest">{user.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nome Completo</label>
              <div className="relative">
                <UserCircleIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none font-medium"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <KeyIcon className="w-4 h-4 text-teal-600" />
                Alterar Senha (opcional)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="Deixe em branco para manter"
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none font-medium text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="Repita a nova senha"
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none font-medium text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${isError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <CheckCircleIcon className="w-5 h-5" />
              <p className="text-sm font-bold">{message}</p>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-4 rounded-2xl bg-teal-600 text-white font-black text-lg shadow-lg shadow-teal-500/20 active:scale-95 transition-all hover:bg-teal-700"
            >
              Atualizar Dados do Perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
