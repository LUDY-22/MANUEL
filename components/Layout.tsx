
import React from 'react';
import { User, UserRole } from '../types';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  ArchiveBoxIcon, 
  ChartBarIcon, 
  ExclamationCircleIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  setPage: (page: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, currentPage, setPage, children }) => {
  const navItems = [
    { id: 'dashboard', name: 'Início', icon: HomeIcon, roles: [UserRole.ADMIN, UserRole.VENDOR] },
    { id: 'sales', name: 'Vender', icon: ShoppingBagIcon, roles: [UserRole.ADMIN, UserRole.VENDOR] },
    { id: 'inventory', name: 'Estoque', icon: ArchiveBoxIcon, roles: [UserRole.ADMIN, UserRole.VENDOR] },
    { id: 'damages', name: 'Danos', icon: ExclamationCircleIcon, roles: [UserRole.ADMIN, UserRole.VENDOR] },
    { id: 'reports', name: 'Relatórios', icon: ChartBarIcon, roles: [UserRole.ADMIN] },
    { id: 'settings', name: 'Perfil', icon: Cog6ToothIcon, roles: [UserRole.ADMIN, UserRole.VENDOR] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-bold">L</div>
          <h1 className="text-xl font-bold tracking-tight">LUVIEL Fluxo</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role.toLowerCase()}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            title="Sair"
          >
            <ArrowLeftOnRectangleIcon className="w-6 h-6 text-slate-300" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-4 shrink-0">
          <nav className="space-y-1">
            {filteredNav.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentPage === item.id 
                    ? 'bg-teal-50 text-teal-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${currentPage === item.id ? 'text-teal-600' : 'text-slate-400'}`} />
                {item.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 pb-20 md:pb-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50">
        {filteredNav.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentPage === item.id ? 'text-teal-600' : 'text-slate-400'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
