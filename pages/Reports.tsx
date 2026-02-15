
import React, { useState } from 'react';
import { db } from '../services/db';
import { User, UserRole } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { 
  ArrowTrendingUpIcon, 
  BanknotesIcon, 
  CalendarDaysIcon, 
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

const Reports: React.FC<{ user: User }> = ({ user }) => {
  const [filter, setFilter] = useState<'day' | 'week' | 'month'>('day');

  if (user.role !== UserRole.ADMIN) {
    return (
      <div className="bg-white p-12 rounded-3xl shadow-sm flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Acesso Restrito</h3>
        <p className="text-slate-500 max-w-xs">Acesso restrito ao administrador. Somente ele pode visualizar relatórios de lucros e fluxo de caixa.</p>
      </div>
    );
  }

  const allSales = db.getSales();
  const allCash = db.getCashEntries();

  const now = new Date();
  const getFilteredData = (data: any[]) => {
    return data.filter(item => {
      const date = new Date(item.date);
      if (filter === 'day') return date.toDateString() === now.toDateString();
      if (filter === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo;
      }
      return true;
    });
  };

  const filteredSales = getFilteredData(allSales);
  const totalRev = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalProfit = filteredSales.reduce((acc, s) => acc + s.profit, 0);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'DINHEIRO': return <BanknotesIcon className="w-3 h-3" />;
      case 'MULTICAIXA': return <CreditCardIcon className="w-3 h-3" />;
      default: return <ArrowsRightLeftIcon className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relatórios Financeiros</h2>
          <p className="text-slate-500">Fluxo de caixa e lucratividade detalhada.</p>
        </div>
        <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
          {(['day', 'week', 'month'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f === 'day' ? 'Hoje' : f === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-teal-600 p-6 rounded-3xl text-white shadow-lg shadow-teal-500/20">
          <BanknotesIcon className="w-8 h-8 mb-4 opacity-50" />
          <p className="text-teal-100 text-xs font-bold uppercase tracking-widest mb-1">Receita no Período</p>
          <p className="text-3xl font-black">{formatCurrency(totalRev)}</p>
        </div>
        <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-500/20">
          <ArrowTrendingUpIcon className="w-8 h-8 mb-4 opacity-50" />
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Lucro Bruto</p>
          <p className="text-3xl font-black">{formatCurrency(totalProfit)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 font-bold text-xs uppercase">Margem de Lucro</span>
            <span className="text-teal-600 font-black">{totalRev > 0 ? ((totalProfit/totalRev)*100).toFixed(1) : 0}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full" style={{ width: `${totalRev > 0 ? (totalProfit/totalRev)*100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histórico de Vendas */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5 text-teal-600" />
              Histórico de Vendas
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase">
                <tr>
                  <th className="px-5 py-3">ID / Data</th>
                  <th className="px-5 py-3">Pgto.</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Lucro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map(s => (
                  <tr key={s.id} className="text-sm hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">#{s.id.slice(-4)}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(s.date)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        {getMethodIcon(s.paymentMethod)}
                        {s.paymentMethod}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-teal-600">{formatCurrency(s.total)}</td>
                    <td className="px-5 py-4 text-emerald-600 font-bold">{formatCurrency(s.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fluxo de Caixa */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <BanknotesIcon className="w-5 h-5 text-indigo-600" />
              Movimentações de Caixa
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {getFilteredData(allCash).map(e => (
              <div key={e.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className={`p-2 rounded-lg ${e.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {e.type === 'INCOME' ? <ArrowUpCircleIcon className="w-5 h-5" /> : <ArrowDownCircleIcon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{e.description}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(e.date)}</p>
                </div>
                <p className={`font-bold ${e.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {e.type === 'INCOME' ? '+' : '-'} {formatCurrency(e.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
