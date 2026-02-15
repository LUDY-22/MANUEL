
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Product, User, UserRole } from '../types';
import { formatCurrency, generateId } from '../utils';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Inventory: React.FC<{ user: User }> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStock, setMinStock] = useState('');

  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(db.getProducts());
  };

  const handleOpenModal = (p: Product | null = null) => {
    if (!isAdmin) {
      alert("Acesso restrito ao administrador para gerir produtos.");
      return;
    }
    setEditingProduct(p);
    if (p) {
      setName(p.name);
      setPrice(p.price.toString());
      setCost(p.cost.toString());
      setQuantity(p.quantity.toString());
      setMinStock(p.minStock.toString());
    } else {
      setName('');
      setPrice('');
      setCost('');
      setQuantity('');
      setMinStock('5');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : generateId(),
      name,
      price: parseFloat(price),
      cost: parseFloat(cost),
      quantity: parseInt(quantity),
      minStock: parseInt(minStock)
    };
    db.saveProduct(newProduct);
    setIsModalOpen(false);
    loadProducts();
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja apagar este produto?")) {
      db.deleteProduct(id);
      loadProducts();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Controle de Estoque</h2>
          <p className="text-slate-500">Gerencie seus produtos e níveis de estoque.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-teal-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold hover:bg-teal-700 transition-all shadow-md active:scale-95"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Produto
          </button>
        )}
      </header>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text"
          placeholder="Pesquisar produto pelo nome..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Qtd. Atual</th>
                <th className="px-6 py-4">Preço (Kz)</th>
                {isAdmin && <th className="px-6 py-4">Custo (Kz)</th>}
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">ID: {p.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg font-bold text-sm ${
                        p.quantity <= p.minStock ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-600'
                      }`}>
                        {p.quantity}
                      </span>
                      {p.quantity <= p.minStock && (
                        <span className="text-[10px] text-red-500 font-bold animate-pulse">BAIXO</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{formatCurrency(p.price)}</td>
                  {isAdmin && <td className="px-6 py-4 text-slate-500">{formatCurrency(p.cost)}</td>}
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(p)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">Nenhum produto encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome do Produto</label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Preço de Venda (Kz)</label>
                  <input 
                    type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Custo de Compra (Kz)</label>
                  <input 
                    type="number" step="0.01" required value={cost} onChange={e => setCost(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Estoque Inicial</label>
                  <input 
                    type="number" required value={quantity} onChange={e => setQuantity(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Alerta Mínimo</label>
                  <input 
                    type="number" required value={minStock} onChange={e => setMinStock(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                </div>
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
                  className="flex-1 px-4 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md active:scale-95 transition-all"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
