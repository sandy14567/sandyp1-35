// Local Storage Management for POS System

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  barcode?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Transaction {
  id: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  customerId?: string;
  cashierId: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface DailySales {
  date: string;
  totalSales: number;
  totalTransactions: number;
  totalItems: number;
}

// Storage Keys
const STORAGE_KEYS = {
  PRODUCTS: 'pos_products',
  TRANSACTIONS: 'pos_transactions',
  CUSTOMERS: 'pos_customers',
  SETTINGS: 'pos_settings',
} as const;

// Generic Storage Functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
  }
}

// Product Management
export const productStorage = {
  getAll: (): Product[] => getFromStorage(STORAGE_KEYS.PRODUCTS, []),
  
  save: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const products = productStorage.getAll();
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },
  
  update: (id: string, updates: Partial<Product>): Product | null => {
    const products = productStorage.getAll();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return products[index];
  },
  
  delete: (id: string): boolean => {
    const products = productStorage.getAll();
    const filteredProducts = products.filter(p => p.id !== id);
    if (filteredProducts.length === products.length) return false;
    
    saveToStorage(STORAGE_KEYS.PRODUCTS, filteredProducts);
    return true;
  },
  
  getById: (id: string): Product | null => {
    const products = productStorage.getAll();
    return products.find(p => p.id === id) || null;
  },
  
  updateStock: (id: string, newStock: number): boolean => {
    const product = productStorage.update(id, { stock: newStock });
    return product !== null;
  },
};

// Transaction Management
export const transactionStorage = {
  getAll: (): Transaction[] => getFromStorage(STORAGE_KEYS.TRANSACTIONS, []),
  
  save: (transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const transactions = transactionStorage.getAll();
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    
    // Update product stock
    newTransaction.items.forEach(item => {
      const product = productStorage.getById(item.productId);
      if (product) {
        productStorage.updateStock(item.productId, product.stock - item.quantity);
      }
    });
    
    return newTransaction;
  },
  
  getByDateRange: (startDate: string, endDate: string): Transaction[] => {
    const transactions = transactionStorage.getAll();
    return transactions.filter(t => {
      const transactionDate = t.createdAt.split('T')[0];
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  },
  
  getTodaysTransactions: (): Transaction[] => {
    const today = new Date().toISOString().split('T')[0];
    return transactionStorage.getByDateRange(today, today);
  },
};

// Customer Management
export const customerStorage = {
  getAll: (): Customer[] => getFromStorage(STORAGE_KEYS.CUSTOMERS, []),
  
  save: (customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const customers = customerStorage.getAll();
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    return newCustomer;
  },
  
  update: (id: string, updates: Partial<Customer>): Customer | null => {
    const customers = customerStorage.getAll();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    customers[index] = { ...customers[index], ...updates };
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    return customers[index];
  },
  
  delete: (id: string): boolean => {
    const customers = customerStorage.getAll();
    const filteredCustomers = customers.filter(c => c.id !== id);
    if (filteredCustomers.length === customers.length) return false;
    
    saveToStorage(STORAGE_KEYS.CUSTOMERS, filteredCustomers);
    return true;
  },
};

// Analytics & Reports
export const analyticsStorage = {
  getDailySales: (days: number = 30): DailySales[] => {
    const transactions = transactionStorage.getAll();
    const salesMap = new Map<string, DailySales>();
    
    // Initialize with zeros for the last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      salesMap.set(dateStr, {
        date: dateStr,
        totalSales: 0,
        totalTransactions: 0,
        totalItems: 0,
      });
    }
    
    // Aggregate actual sales data
    transactions.forEach(transaction => {
      const date = transaction.createdAt.split('T')[0];
      const existing = salesMap.get(date);
      if (existing) {
        existing.totalSales += transaction.total;
        existing.totalTransactions += 1;
        existing.totalItems += transaction.items.reduce((sum, item) => sum + item.quantity, 0);
      }
    });
    
    return Array.from(salesMap.values());
  },
  
  getTopProducts: (limit: number = 10): Array<Product & { totalSold: number }> => {
    const transactions = transactionStorage.getAll();
    const productSales = new Map<string, number>();
    
    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const current = productSales.get(item.productId) || 0;
        productSales.set(item.productId, current + item.quantity);
      });
    });
    
    const products = productStorage.getAll();
    return products
      .map(product => ({
        ...product,
        totalSold: productSales.get(product.id) || 0,
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);
  },
  
  getTotalRevenue: (): number => {
    const transactions = transactionStorage.getAll();
    return transactions.reduce((total, transaction) => total + transaction.total, 0);
  },
  
  getTodaysRevenue: (): number => {
    const todaysTransactions = transactionStorage.getTodaysTransactions();
    return todaysTransactions.reduce((total, transaction) => total + transaction.total, 0);
  },
};

// Initialize with sample data if empty
export const initializeSampleData = (): void => {
  const products = productStorage.getAll();
  if (products.length === 0) {
    // Add sample products
    const sampleProducts = [
      { name: 'Kopi Americano', price: 25000, stock: 50, category: 'Minuman' },
      { name: 'Nasi Goreng', price: 35000, stock: 30, category: 'Makanan' },
      { name: 'Es Teh Manis', price: 12000, stock: 100, category: 'Minuman' },
      { name: 'Ayam Bakar', price: 45000, stock: 20, category: 'Makanan' },
      { name: 'Jus Jeruk', price: 18000, stock: 40, category: 'Minuman' },
    ];
    
    sampleProducts.forEach(product => productStorage.save(product));
  }
};