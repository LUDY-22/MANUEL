
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Product, Sale, SaleItem, User, PaymentMethod } from '../types';
import { formatCurrency, generateId } from '../utils';
import { 
  ShoppingCartIcon, 
  PlusIcon, 
  MinusIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  MagnifyingGlassIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

const Sales: React.FC<{ user: User }> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Estados de Pagamento
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DINHEIRO');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(db.getProducts());
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    const currentQtyInCart = existing ? existing.quantity : 0;

    if (product.quantity <= currentQtyInCart) {
      alert("Estoque insuficiente para adicionar mais unidades!");
      return;
    }

    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      const newItem: SaleItem = {
        id: generateId(),
        productId: product.id,
        productName: product.name,
        price: product.price,
        cost: product.cost,
        quantity: 1,
        subtotal: product.price
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === item.productId);
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (product && newQty > product.quantity) {
          alert("Limite de estoque atingido!");
          return item;
        }
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const numericReceived = parseFloat(receivedAmount) || 0;
  const change = paymentMethod === 'DINHEIRO' ? Math.max(0, numericReceived - total) : 0;

  const finalizeSale = () => {
    if (cart.length === 0) return;
    
    if (paymentMethod === 'DINHEIRO' && numericReceived < total) {
      alert("O valor recebido é inferior ao total da venda!");
      return;
    }

    const profit = cart.reduce((acc, item) => acc + (item.price - item.cost) * item.quantity, 0);

    const sale: Sale = {
      id: `S-${generateId()}`,
      date: Date.now(),
      userId: user.id,
      userName: user.name,
      items: cart,
      total,
      profit,
      paymentMethod,
      amountReceived: paymentMethod === 'DINHEIRO' ? numericReceived : total,
      change
    };

    db.recordSale(sale);
    setLastSale(sale);
    setCart([]);
    setReceivedAmount('');
    setShowSuccess(true);
    loadProducts();
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Seleção de Produtos */}
      <div className="lg:col-span-2 space-y-4">
        <header>
          <h2 className="text-2xl font-bold text-slate-800">Nova Venda</h2>
          <p className="text-slate-500">Selecione os itens e confira o estoque restante.</p>
        </header>

        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar produto pelo nome..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.length > 0 ? filteredProducts.map(p => {
            const inCart = cart.find(item => item.productId === p.id)?.quantity || 0;
            const remaining = p.quantity - inCart;

            return (
              <div 
                key={p.id} 
                onClick={() => addToCart(p)}
                className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-teal-200 transition-all active:scale-95 group ${remaining <= 0 ? 'opacity-50 grayscale' : ''}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 line-clamp-1">{p.name}</h4>
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.quantity <= p.minStock ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        Atual: {p.quantity}
                      </span>
                      {inCart > 0 && (
                        <span className="text-[10px] text-teal-600 font-bold mt-1">
                          No carrinho: {inCart}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-teal-600 font-bold text-lg">{formatCurrency(p.price)}</p>
                </div>
                
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                    <span>Restará em estoque:</span>
                    <span className={remaining <= p.minStock ? 'text-red-500' : 'text-slate-600'}>{remaining} un.</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 py-2 bg-slate-50 rounded-xl text-slate-600 font-bold text-xs uppercase tracking-wider group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <PlusIcon className="w-4 h-4" />
                    Adicionar
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-20 text-center text-slate-400">Nenhum produto encontrado.</div>
          )}
        </div>
      </div>

      {/* Resumo e Pagamento */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col sticky top-6 max-h-[calc(100vh-100px)]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCartIcon className="w-5 h-5 text-teal-600" />
              Carrinho
            </h3>
            <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded-full">
              {cart.length} itens
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
            {cart.length > 0 ? cart.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-2 border border-slate-100">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-700 text-sm line-clamp-1">{item.productName}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded-md transition-shadow shadow-sm"><MinusIcon className="w-3 h-3" /></button>
                    <span className="text-sm font-bold min-w-[1.5rem] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded-md transition-shadow shadow-sm"><PlusIcon className="w-3 h-3" /></button>
                  </div>
                  <span className="font-bold text-slate-800">{formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-4 opacity-40">
                <ShoppingCartIcon className="w-12 h-12" />
                <p className="text-sm text-center">Carrinho vazio.</p>
              </div>
            )}
          </div>

          {/* Seção de Pagamento */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 space-y-4 bg-white">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modalidade de Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'DINHEIRO', icon: BanknotesIcon, label: 'Dinheiro' },
                    { id: 'MULTICAIXA', icon: CreditCardIcon, label: 'TPA' },
                    { id: 'TRANSFERENCIA', icon: ArrowsRightLeftIcon, label: 'Transf.' }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                      className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                        paymentMethod === method.id 
                          ? 'border-teal-500 bg-teal-50 text-teal-700 font-bold' 
                          : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <method.icon className="w-5 h-5 mb-1" />
                      <span className="text-[9px] uppercase">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'DINHEIRO' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dinheiro Recebido</label>
                    <input 
                      type="number"
                      placeholder="0,00"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none font-bold text-slate-800"
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Troco a Entregar</label>
                    <div className={`w-full px-3 py-2 rounded-xl font-bold text-lg ${change > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                      {formatCurrency(change)}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 font-medium">Total Geral</span>
                  <span className="text-2xl font-black text-slate-900">{formatCurrency(total)}</span>
                </div>
                
                <button 
                  onClick={finalizeSale}
                  className="w-full py-4 rounded-2xl bg-teal-600 text-white font-black text-lg shadow-lg shadow-teal-500/20 active:scale-95 transition-all hover:bg-teal-700 flex items-center justify-center gap-2"
                >
                  Confirmar e Imprimir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Sucesso com Resumo da Venda */}
      {showSuccess && lastSale && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-sm w-full animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
            </div>
            <h4 className="text-2xl font-black text-slate-800 mb-2">Venda Finalizada!</h4>
            
            <div className="w-full bg-slate-50 rounded-2xl p-5 space-y-3 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 uppercase font-bold">Total Venda</span>
                <span className="text-slate-800 font-black">{formatCurrency(lastSale.total)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 uppercase font-bold">Pagamento</span>
                <span className="text-slate-800 font-bold">{lastSale.paymentMethod}</span>
              </div>
              {lastSale.paymentMethod === 'DINHEIRO' && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 uppercase font-bold">Recebido</span>
                    <span className="text-slate-800 font-bold">{formatCurrency(lastSale.amountReceived)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-orange-500 uppercase font-black">Troco</span>
                    <span className="text-orange-600 font-black text-lg">{formatCurrency(lastSale.change)}</span>
                  </div>
                </>
              )}
            </div>

            <p className="text-slate-400 text-sm mb-6 text-center">O estoque foi reduzido e a movimentação registrada no caixa.</p>
            
            <button 
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
