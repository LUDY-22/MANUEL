
import { Product, Sale, User, UserRole, Damage, CashEntry } from '../types';

/**
 * LUVIEL Fluxo Database Engine
 * Simula um banco SQLite 100% offline via LocalStorage.
 */
class LocalDB {
  private static STORAGE_KEYS = {
    PRODUCTS: 'luviel_products',
    SALES: 'luviel_sales',
    USERS: 'luviel_users',
    DAMAGES: 'luviel_damages',
    CASHFLOW: 'luviel_cashflow'
  };

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Seed users if empty
    if (!localStorage.getItem(LocalDB.STORAGE_KEYS.USERS)) {
      const defaultUsers: User[] = [
        { id: '1', name: 'Administrador', username: 'admin', password: '123', role: UserRole.ADMIN },
        { id: '2', name: 'Vendedor Padrão', username: 'vendedor', password: '123', role: UserRole.VENDOR }
      ];
      localStorage.setItem(LocalDB.STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }

    // Seed empty collections
    [
      LocalDB.STORAGE_KEYS.PRODUCTS,
      LocalDB.STORAGE_KEYS.SALES,
      LocalDB.STORAGE_KEYS.DAMAGES,
      LocalDB.STORAGE_KEYS.CASHFLOW
    ].forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });
  }

  private getData<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setData<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Users ---
  getUsers(): User[] { return this.getData(LocalDB.STORAGE_KEYS.USERS); }
  
  updateUser(updatedUser: User) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index >= 0) {
      users[index] = { ...users[index], ...updatedUser };
      this.setData(LocalDB.STORAGE_KEYS.USERS, users);
      return true;
    }
    return false;
  }

  // --- Products ---
  getProducts(): Product[] { return this.getData(LocalDB.STORAGE_KEYS.PRODUCTS); }
  saveProduct(product: Product) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) products[index] = product;
    else products.push(product);
    this.setData(LocalDB.STORAGE_KEYS.PRODUCTS, products);
  }
  deleteProduct(id: string) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.setData(LocalDB.STORAGE_KEYS.PRODUCTS, products);
  }

  // --- Sales ---
  getSales(): Sale[] { return this.getData(LocalDB.STORAGE_KEYS.SALES); }
  recordSale(sale: Sale) {
    const sales = this.getSales();
    sales.push(sale);
    this.setData(LocalDB.STORAGE_KEYS.SALES, sales);

    // Update product stock
    const products = this.getProducts();
    sale.items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) p.quantity -= item.quantity;
    });
    this.setData(LocalDB.STORAGE_KEYS.PRODUCTS, products);

    // Record in cashflow
    this.recordCashEntry({
      id: `cf-${Date.now()}`,
      date: Date.now(),
      type: 'INCOME',
      amount: sale.total,
      description: `Venda #${sale.id.slice(-4)}`
    });
  }

  // --- Damages ---
  getDamages(): Damage[] { return this.getData(LocalDB.STORAGE_KEYS.DAMAGES); }
  recordDamage(damage: Damage) {
    const damages = this.getDamages();
    damages.push(damage);
    this.setData(LocalDB.STORAGE_KEYS.DAMAGES, damages);

    // Update product stock
    const products = this.getProducts();
    const p = products.find(prod => prod.id === damage.productId);
    if (p) p.quantity -= damage.quantity;
    this.setData(LocalDB.STORAGE_KEYS.PRODUCTS, products);
  }

  // --- Cash Flow ---
  getCashEntries(): CashEntry[] { return this.getData(LocalDB.STORAGE_KEYS.CASHFLOW); }
  recordCashEntry(entry: CashEntry) {
    const entries = this.getCashEntries();
    entries.push(entry);
    this.setData(LocalDB.STORAGE_KEYS.CASHFLOW, entries);
  }
}

export const db = new LocalDB();
