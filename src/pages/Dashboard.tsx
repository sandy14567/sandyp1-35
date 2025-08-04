import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  Users
} from 'lucide-react';
import { analyticsStorage, transactionStorage, productStorage, customerStorage } from '@/lib/storage';

export default function Dashboard() {
  const [stats, setStats] = React.useState({
    todaysRevenue: 0,
    totalTransactions: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
  });

  React.useEffect(() => {
    const todaysRevenue = analyticsStorage.getTodaysRevenue();
    const todaysTransactions = transactionStorage.getTodaysTransactions();
    const products = productStorage.getAll();
    const customers = customerStorage.getAll();
    const lowStockProducts = products.filter(p => p.stock < 10).length;

    setStats({
      todaysRevenue,
      totalTransactions: todaysTransactions.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      lowStockProducts,
    });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Penjualan Hari Ini',
      value: formatCurrency(stats.todaysRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Transaksi Hari Ini',
      value: stats.totalTransactions.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Produk',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Pelanggan',
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-primary text-white rounded-2xl p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Selamat Datang di Modern POS
            </h1>
            <p className="text-primary-foreground/80">
              Kelola bisnis Anda dengan mudah dan efisien
            </p>
          </div>
          <TrendingUp className="h-12 w-12 text-primary-foreground/80" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <a 
              href="/cashier" 
              className="block p-4 rounded-lg border-2 border-dashed border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all text-center"
            >
              <div className="text-lg font-semibold text-primary mb-1">
                Mulai Transaksi Baru
              </div>
              <div className="text-sm text-muted-foreground">
                Buka kasir untuk melayani pelanggan
              </div>
            </a>
            <a 
              href="/products" 
              className="block p-4 rounded-lg border-2 border-dashed border-accent/20 hover:border-accent/40 hover:bg-accent/5 transition-all text-center"
            >
              <div className="text-lg font-semibold text-accent mb-1">
                Kelola Produk
              </div>
              <div className="text-sm text-muted-foreground">
                Tambah atau edit produk
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-warning" />
              Stok Menipis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts > 0 ? (
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-warning mb-2">
                  {stats.lowStockProducts}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  produk dengan stok kurang dari 10
                </div>
                <a 
                  href="/products" 
                  className="inline-flex items-center px-4 py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition-colors text-sm font-medium"
                >
                  Lihat Produk
                </a>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div>Semua produk memiliki stok yang cukup</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}