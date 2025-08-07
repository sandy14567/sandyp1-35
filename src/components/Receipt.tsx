import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, X } from 'lucide-react';

interface ReceiptItem {
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  timestamp: Date;
  cashierName: string;
}

export default function Receipt({
  isOpen,
  onClose,
  transactionId,
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  timestamp,
  cashierName
}: ReceiptProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Tunai';
      case 'card': return 'Kartu';
      case 'digital': return 'E-Wallet';
      default: return method;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text receipt for download
    const receiptText = `
SUPERMARKET POS
================================
Struk Pembayaran

ID Transaksi: ${transactionId}
Tanggal: ${formatDate(timestamp)}
Kasir: ${cashierName}

================================
DETAIL PEMBELIAN:

${items.map(item => 
  `${item.productName}\n${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.total)}`
).join('\n\n')}

================================
RINGKASAN:
Subtotal: ${formatCurrency(subtotal)}
Pajak (10%): ${formatCurrency(tax)}
Total: ${formatCurrency(total)}

Metode Pembayaran: ${getPaymentMethodLabel(paymentMethod)}

================================
Terima kasih atas kunjungan Anda!
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `struk-${transactionId.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Struk Pembayaran</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 print:text-black">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">SUPERMARKET POS</h2>
            <div className="text-sm text-muted-foreground">
              <p>ID: {transactionId.slice(0, 8).toUpperCase()}</p>
              <p>{formatDate(timestamp)}</p>
              <p>Kasir: {cashierName}</p>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-3">
            <h3 className="font-semibold">Detail Pembelian:</h3>
            {items.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm">{item.productName}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{item.quantity} x {formatCurrency(item.price)}</span>
                  <span>{formatCurrency(item.total)}</span>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pajak (10%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <Separator />

          {/* Payment Method */}
          <div className="flex justify-between items-center">
            <span className="text-sm">Metode Pembayaran:</span>
            <Badge variant="secondary">
              {getPaymentMethodLabel(paymentMethod)}
            </Badge>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-4">
            Terima kasih atas kunjungan Anda!
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 print:hidden">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}