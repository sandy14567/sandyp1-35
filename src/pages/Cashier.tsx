import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  Banknote,
  Smartphone,
  Search,
  Package
} from 'lucide-react';
import { productStorage, transactionStorage, type Product } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Cashier() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const { toast } = useToast();

  React.useEffect(() => {
    const allProducts = productStorage.getAll();
    setProducts(allProducts);
  }, []);

  const categories = React.useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['Semua', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.barcode?.includes(searchTerm);
      const matchesCategory = selectedCategory === '' || selectedCategory === 'Semua' || 
                             product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.stock > 0;
    });
  }, [products, searchTerm, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast({
            title: "Stok tidak cukup",
            description: `Stok ${product.name} hanya tersisa ${product.stock}`,
            variant: "destructive"
          });
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock) {
      toast({
        title: "Stok tidak cukup",
        description: `Stok ${product.name} hanya tersisa ${product.stock}`,
        variant: "destructive"
      });
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    return { subtotal, tax, total: subtotal + tax };
  };

  const processPayment = (paymentMethod: 'cash' | 'card' | 'digital') => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang kosong",
        description: "Tambahkan produk ke keranjang terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    const { subtotal, tax, total } = calculateTotal();
    
    const transaction = transactionStorage.save({
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        total: item.product.price * item.quantity,
      })),
      subtotal,
      tax,
      total,
      paymentMethod,
      cashierId: 'cashier-1', // In real app, this would be the logged-in user
    });

    toast({
      title: "Transaksi berhasil",
      description: `Transaksi ${transaction.id.slice(0, 8)} telah disimpan`,
    });

    // Update products state to reflect new stock
    setProducts(prev => 
      prev.map(product => {
        const cartItem = cart.find(item => item.product.id === product.id);
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity };
        }
        return product;
      })
    );

    clearCart();
  };

  const { subtotal, tax, total } = calculateTotal();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col xl:flex-row gap-4 p-4 h-screen">
        {/* Products Section */}
        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-primary text-white rounded-xl p-6">
            <h1 className="text-2xl font-bold mb-2">Kasir</h1>
            <p className="text-primary-foreground/80">Pilih produk untuk ditambahkan ke keranjang</p>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari produk atau scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category || (category === 'Semua' && selectedCategory === '') ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category === 'Semua' ? '' : category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 overflow-y-auto flex-1">
            {filteredProducts.map(product => (
              <Card key={product.id} className="shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(product.price)}
                    </span>
                    <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'}>
                      Stok: {product.stock}
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => addToCart(product)}
                    className="w-full"
                    disabled={product.stock === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Tidak ada produk yang ditemukan</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cart Section */}
        <div className="w-full xl:w-96 flex-shrink-0">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Keranjang ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Keranjang kosong</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.product.price)} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="min-w-[2rem] text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pajak (10%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Payment Buttons */}
                  <div className="space-y-2 pt-4">
                    <Button 
                      onClick={() => processPayment('cash')}
                      className="w-full bg-pos-green hover:bg-pos-green/90"
                    >
                      <Banknote className="h-4 w-4 mr-2" />
                      Bayar Tunai
                    </Button>
                    <Button 
                      onClick={() => processPayment('card')}
                      className="w-full"
                      variant="outline"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Bayar Kartu
                    </Button>
                    <Button 
                      onClick={() => processPayment('digital')}
                      className="w-full"
                      variant="outline"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      E-Wallet
                    </Button>
                  </div>

                  <Button 
                    onClick={clearCart}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Kosongkan Keranjang
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}