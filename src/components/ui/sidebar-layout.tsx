import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Receipt,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { authService } from '@/lib/auth';

interface SidebarLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Kasir', href: '/cashier', icon: ShoppingCart },
  { name: 'Produk', href: '/products', icon: Package },
  { name: 'Transaksi', href: '/transactions', icon: Receipt },
  { name: 'Pelanggan', href: '/customers', icon: Users },
  { name: 'Laporan', href: '/reports', icon: BarChart3 },
];

export function SidebarLayout({ children, onLogout }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 to-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <div>
              <h1 className="text-xl font-bold text-white">Modern POS</h1>
              <p className="text-xs text-slate-400">Supermarket System</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-slate-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* User Info */}
          <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-full p-2">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{currentUser?.name}</p>
                <p className="text-slate-400 text-xs capitalize">{currentUser?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-slate-300 hover:text-white hover:bg-slate-700 justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
            <div className="text-xs text-slate-400 text-center mt-3">
              Modern POS v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Modern POS</h1>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}