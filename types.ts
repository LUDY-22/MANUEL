
export enum UserRole {
  ADMIN = 'ADMIN',
  VENDOR = 'VENDOR'
}

export type PaymentMethod = 'DINHEIRO' | 'MULTICAIXA' | 'TRANSFERENCIA';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  cost: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  date: number;
  userId: string;
  userName: string;
  items: SaleItem[];
  total: number;
  profit: number;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  change: number;
}

export interface Damage {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  date: number;
}

export interface CashEntry {
  id: string;
  date: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
}
