import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { customerStorage, type Customer } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export default function Customers() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  React.useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const allCustomers = customerStorage.getAll();
    setCustomers(allCustomers.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const filteredCustomers = React.useMemo(() => {
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
    setEditingCustomer(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Data tidak lengkap",
        description: "Nama pelanggan wajib diisi",
        variant: "destructive"
      });
      return;
    }

    const customerData = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
    };

    if (editingCustomer) {
      customerStorage.update(editingCustomer.id, customerData);
      toast({
        title: "Pelanggan berhasil diperbarui",
        description: `Data ${customerData.name} telah diperbarui`,
      });
    } else {
      customerStorage.save(customerData);
      toast({
        title: "Pelanggan berhasil ditambahkan",
        description: `${customerData.name} telah ditambahkan ke database`,
      });
    }

    loadCustomers();
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setEditingCustomer(customer);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    if (window.confirm(`Yakin ingin menghapus ${customer.name}?`)) {
      customerStorage.delete(customer.id);
      loadCustomers();
      toast({
        title: "Pelanggan berhasil dihapus",
        description: `${customer.name} telah dihapus dari database`,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-primary text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Manajemen Pelanggan</h1>
            <p className="text-primary-foreground/80">Kelola data pelanggan Anda</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-white text-primary hover:bg-gray-100"
                onClick={resetForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pelanggan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama pelanggan"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Masukkan email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">No. Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Masukkan alamat"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingCustomer ? 'Perbarui' : 'Simpan'}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pelanggan</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dengan Email</p>
                <p className="text-2xl font-bold">{customers.filter(c => c.email).length}</p>
              </div>
              <Mail className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dengan Telepon</p>
                <p className="text-2xl font-bold">{customers.filter(c => c.phone).length}</p>
              </div>
              <Phone className="h-8 w-8 text-success" />
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
              placeholder="Cari pelanggan berdasarkan nama, email, atau telepon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => (
          <Card key={customer.id} className="shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(customer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(customer)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{customer.name}</h3>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{customer.address}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Bergabung: {formatDate(customer.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {customers.length === 0 ? 'Belum ada pelanggan' : 'Tidak ada pelanggan yang ditemukan'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}