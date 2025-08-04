import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  DollarSign,
  Calendar,
  Download
} from 'lucide-react';
import { analyticsStorage, transactionStorage, productStorage } from '@/lib/storage';

export default function Reports() {
  const [salesData, setSalesData] = React.useState<any[]>([]);
  const [topProducts, setTopProducts] = React.useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'7' | '30' | '90'>('30');

  React.useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = () => {
    const days = parseInt(selectedPeriod);
    const dailySales = analyticsStorage.getDailySales(days);
    const topSellingProducts = analyticsStorage.getTopProducts(10);
    
    setSalesData(dailySales);
    setTopProducts(topSellingProducts);
  };

  const totalRevenue = analyticsStorage.getTotalRevenue();
  const todaysRevenue = analyticsStorage.getTodaysRevenue();
  const transactions = transactionStorage.getAll();
  const products = productStorage.getAll();

  // Calculate growth (mock calculation)
  const lastPeriodRevenue = salesData
    .slice(0, Math.floor(salesData.length / 2))
    .reduce((sum, day) => sum + day.totalSales, 0);
  const currentPeriodRevenue = salesData
    .slice(Math.floor(salesData.length / 2))
    .reduce((sum, day) => sum + day.totalSales, 0);
  const growthRate = lastPeriodRevenue > 0 
    ? ((currentPeriodRevenue - lastPeriodRevenue) / lastPeriodRevenue) * 100 
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
    });
  };

  const maxSales = Math.max(...salesData.map(d => d.totalSales));

  const exportReport = () => {
    // Create CSV content
    const csvContent = [
      ['Tanggal', 'Total Penjualan', 'Jumlah Transaksi', 'Jumlah Item'],
      ...salesData.map(day => [
        day.date,
        day.totalSales,
        day.totalTransactions,
        day.totalItems
      ])
    ].map(row => row.join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-penjualan-${selectedPeriod}-hari.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-primary text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Laporan Penjualan</h1>
            <p className="text-primary-foreground/80">Analisis performa bisnis Anda</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {(['7', '30', '90'] as const).map(period => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  {period} Hari
                </Button>
              ))}
            </div>
            <Button 
              variant="secondary"
              size="sm"
              onClick={exportReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hari Ini</p>
                <p className="text-2xl font-bold">{formatCurrency(todaysRevenue)}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pertumbuhan</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{growthRate.toFixed(1)}%</p>
                  <TrendingUp className={`h-4 w-4 ${growthRate >= 0 ? 'text-success' : 'text-destructive'}`} />
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transaksi</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <Package className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tren Penjualan ({selectedPeriod} Hari Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.slice(-14).map((day, index) => (
                <div key={day.date} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-muted-foreground">
                    {formatDate(day.date)}
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-8 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                        style={{ 
                          width: maxSales > 0 ? `${(day.totalSales / maxSales) * 100}%` : '0%' 
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center px-2">
                      <span className="text-xs font-medium text-white">
                        {day.totalTransactions > 0 && formatCurrency(day.totalSales)}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 text-xs text-right">
                    {day.totalTransactions} trx
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produk Terlaris
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.slice(0, 10).map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{product.totalSold}</div>
                    <div className="text-xs text-muted-foreground">terjual</div>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada data penjualan produk</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ringkasan Periode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Penjualan</span>
              <span className="font-semibold">
                {formatCurrency(salesData.reduce((sum, day) => sum + day.totalSales, 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Transaksi</span>
              <span className="font-semibold">
                {salesData.reduce((sum, day) => sum + day.totalTransactions, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Item Terjual</span>
              <span className="font-semibold">
                {salesData.reduce((sum, day) => sum + day.totalItems, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rata-rata per Hari</span>
              <span className="font-semibold">
                {formatCurrency(
                  salesData.length > 0 
                    ? salesData.reduce((sum, day) => sum + day.totalSales, 0) / salesData.length 
                    : 0
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Produk</span>
              <span className="font-semibold">{products.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stok Menipis</span>
              <span className="font-semibold text-warning">
                {products.filter(p => p.stock < 10).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stok Habis</span>
              <span className="font-semibold text-destructive">
                {products.filter(p => p.stock === 0).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Nilai Stok</span>
              <span className="font-semibold">
                {formatCurrency(products.reduce((sum, p) => sum + (p.price * p.stock), 0))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { method: 'cash', label: 'Tunai', color: 'bg-success' },
              { method: 'card', label: 'Kartu', color: 'bg-primary' },
              { method: 'digital', label: 'E-Wallet', color: 'bg-accent' },
            ].map(({ method, label, color }) => {
              const count = transactions.filter(t => t.paymentMethod === method).length;
              const percentage = transactions.length > 0 ? (count / transactions.length) * 100 : 0;
              return (
                <div key={method} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}