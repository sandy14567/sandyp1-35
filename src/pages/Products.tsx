import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Package
} from 'lucide-react';
import { productStorage, type Product } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';

export default function Products() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    barcode: '',
    image: undefined as string | undefined,
  });

  React.useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const allProducts = productStorage.getAll();
    setProducts(allProducts);
  };

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
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: '',
      barcode: '',
      image: undefined,
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast({
        title: "Data tidak lengkap",
        description: "Harap isi semua field yang wajib",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      barcode: formData.barcode || undefined,
      image: formData.image,
    };

    if (editingProduct) {
      productStorage.update(editingProduct.id, productData);
      toast({
        title: "Produk berhasil diperbarui",
        description: `${productData.name} telah diperbarui`,
      });
    } else {
      productStorage.save(productData);
      toast({
        title: "Produk berhasil ditambahkan",
        description: `${productData.name} telah ditambahkan ke inventory`,
      });
    }

    loadProducts();
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      barcode: product.barcode || '',
      image: product.image,
    });
    setEditingProduct(product);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`Yakin ingin menghapus ${product.name}?`)) {
      productStorage.delete(product.id);
      loadProducts();
      toast({
        title: "Produk berhasil dihapus",
        description: `${product.name} telah dihapus dari inventory`,
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-primary text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Manajemen Produk</h1>
            <p className="text-primary-foreground/80">Kelola produk dan inventory Anda</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-white text-primary hover:bg-gray-100"
                onClick={resetForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Upload */}
                  <div>
                    <Label>Gambar Produk</Label>
                    <ImageUpload
                      value={formData.image}
                      onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                    />
                  </div>
                  
                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nama Produk *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Masukkan nama produk"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Kategori *</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Masukkan kategori"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Harga *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stok *</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                        placeholder="Masukkan barcode (opsional)"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? 'Perbarui' : 'Simpan'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari produk atau barcode..."
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(product.price)}
                  </span>
                  <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'}>
                    Stok: {product.stock}
                  </Badge>
                </div>
                {product.barcode && (
                  <p className="text-xs text-muted-foreground font-mono">
                    {product.barcode}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEdit(product)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(product)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {products.length === 0 ? 'Belum ada produk' : 'Tidak ada produk yang ditemukan'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}