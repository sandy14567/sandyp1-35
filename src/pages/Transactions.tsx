import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Receipt, 
  Search,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  Eye
} from 'lucide-react';
import { transactionStorage, type Transaction } from '@/lib/storage';

export default function Transactions() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);

  React.useEffect(() => {
    const allTransactions = transactionStorage.getAll();
    setTransactions(allTransactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }, []);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(transaction => 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.items.some(item => 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [transactions, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'digital': return <Smartphone className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Tunai';
      case 'card': return 'Kartu';
      case 'digital': return 'E-Wallet';
      default: return method;
    }
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const todayTransactions = transactions.filter(t => {
    const today = new Date().toDateString();
    const transactionDate = new Date(t.createdAt).toDateString();
    return today === transactionDate;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-primary text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Riwayat Transaksi</h1>
            <p className="text-primary-foreground/80">Kelola dan pantau semua transaksi</p>
          </div>
          <Receipt className="h-12 w-12 text-primary-foreground/80" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transaksi</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <Receipt className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaksi Hari Ini</p>
                <p className="text-2xl font-bold">{todayTransactions.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <Banknote className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari transaksi berdasarkan ID atau nama produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTransactions.map(transaction => (
          <Card key={transaction.id} className="shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">#{transaction.id.slice(0, 8)}</h3>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                      {getPaymentMethodLabel(transaction.paymentMethod)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(transaction.total)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.items.length} item(s)
                  </p>
                </div>
              </div>

              {/* Transaction Items */}
              <div className="space-y-2 mb-4">
                {transaction.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.productName}
                    </span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                ))}
                {transaction.items.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    +{transaction.items.length - 3} item lainnya
                  </p>
                )}
              </div>

              {/* Transaction Summary */}
              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(transaction.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pajak</span>
                  <span>{formatCurrency(transaction.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(transaction.total)}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Lihat Detail
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {transactions.length === 0 ? 'Belum ada transaksi' : 'Tidak ada transaksi yang ditemukan'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Detail Transaksi
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedTransaction(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">ID Transaksi</p>
                <p className="font-mono">{selectedTransaction.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Waktu</p>
                <p>{formatDate(selectedTransaction.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metode Pembayaran</p>
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(selectedTransaction.paymentMethod)}
                  {getPaymentMethodLabel(selectedTransaction.paymentMethod)}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {selectedTransaction.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.productName}</span>
                      <span>{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedTransaction.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak (10%)</span>
                  <span>{formatCurrency(selectedTransaction.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(selectedTransaction.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}