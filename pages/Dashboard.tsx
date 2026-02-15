
import React from 'react';
import { db } from '../services/db';
import { User, UserRole } from '../types';
import { formatCurrency } from '../utils';
import { 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  CubeIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const products = db.getProducts();
  const sales = db.getSales();
  const isAdmin = user.role === UserRole.ADMIN;

  const lowStock = products.filter(p => p.quantity <= p.minStock);
  const totalSalesVal = sales.reduce((acc, s) => acc + s.total, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);
  
  const stats = [
    { 
      name: 'Vendas Totais', 
      value: formatCurrency(totalSalesVal), 
      icon: BanknotesIcon, 
      color: 'bg-blue-500', 
      textColor: 'text-blue-600',
      visible: true 
    },
    { 
      name: 'Lucro Estimado', 
      value: isAdmin ? formatCurrency(totalProfit) : 'Restrito', 
      icon: ArrowTrendingUpIcon, 
      color: 'bg-emerald-500', 
      textColor: 'text-emerald-600',
      visible: true 
    },
    { 
      name: 'Itens em Estoque', 
      value: products.length.toString(), 
      icon: CubeIcon, 
      color: 'bg-indigo-500', 
      textColor: 'text-indigo-600',
      visible: true 
    },
    { 
      name: 'Alertas de Estoque', 
      value: lowStock.length.toString(), 
      icon: ExclamationTriangleIcon, 
      color: 'bg-orange-500', 
      textColor: 'text-orange-600',
      visible: true 
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Resumo Operacional</h2>
        <p className="text-slate-500">Bem-vindo ao LUVIEL Fluxo. Veja os dados do dia.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.name}</p>
              <p className="text-lg font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de Estoque */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
              Produtos com Estoque Baixo
            </h3>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
              {lowStock.length} alertas
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {lowStock.length > 0 ? lowStock.map(p => (
              <div key={p.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-medium text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-400">Mínimo: {p.minStock}</p>
                </div>
                <p className="text-red-600 font-bold">{p.quantity} unid.</p>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-400 text-sm">Tudo em ordem com o estoque!</div>
            )}
          </div>
        </div>

        {/* Últimas Vendas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-teal-500" />
              Vendas Recentes
            </h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {sales.length > 0 ? sales.slice(-5).reverse().map(s => (
              <div key={s.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-medium text-slate-800">#{s.id.slice(-4)}</p>
                  <p className="text-xs text-slate-400">{new Date(s.date).toLocaleTimeString('pt-AO')}</p>
                </div>
                <p className="text-teal-600 font-bold">{formatCurrency(s.total)}</p>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-400 text-sm">Nenhuma venda realizada hoje.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Re-using icon
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

export default Dashboard;
