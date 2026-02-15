
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Product, Damage, User } from '../types';
import { generateId, formatDate } from '../utils';
import { PlusIcon, ExclamationCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const DamagePage: React.FC<{ user: User }> = ({ user }) => {
  const [damages, setDamages] = useState<Damage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setDamages(db.getDamages());
    setProducts(db.getProducts());
  };

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (parseInt(quantity) > product.quantity) {
      alert("A quantidade de dano não pode ser maior que o estoque disponível.");
      return;
    }

    const newDamage: Damage = {
      id: generateId(),
      productId,
      productName: product.name,
      quantity: parseInt(quantity),
      reason,
      date: Date.now()
    };

    db.recordDamage(newDamage);
    setIsModalOpen(false);
    loadData();
    setProductId('');
    setQuantity('');
    setReason('');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Controle de Danos</h2>
          <p className="text-slate-500">Registre itens danificados ou extraviados.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold hover:bg-red-700 shadow-md active:scale-95 transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          Registrar Dano
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Qtd.</th>
                <th className="px-6 py-4">Motivo / Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {damages.length > 0 ? damages.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(d.date)}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{d.productName}</td>
                  <td className="px-6 py-4">
                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg font-bold text-sm">
                      -{d.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm italic">"{d.reason}"</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400">Nenhum registro de dano encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-red-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-red-800">Registrar Dano</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-red-400 hover:text-red-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleRecord} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Selecionar Produto</label>
                <select 
                  required value={productId} onChange={e => setProductId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                >
                  <option value="">Escolha um produto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Saldo: {p.quantity})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Quantidade Danificada</label>
                <input 
                  type="number" required value={quantity} onChange={e => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                  min="1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Motivo do Dano</label>
                <textarea 
                  required value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Ex: Quebrado no transporte, validade vencida..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none h-24 resize-none"
                ></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-md active:scale-95 transition-all"
                >
                  Registrar Perda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DamagePage;
