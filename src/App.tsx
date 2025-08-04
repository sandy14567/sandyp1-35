import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarLayout } from "@/components/ui/sidebar-layout";
import Dashboard from "./pages/Dashboard";
import Cashier from "./pages/Cashier";
import Products from "./pages/Products";
import Transactions from "./pages/Transactions";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import { initializeSampleData } from "@/lib/storage";

const queryClient = new QueryClient();

// Initialize sample data on app start
initializeSampleData();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cashier" element={<Cashier />} />
            <Route path="/products" element={<Products />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/reports" element={<Reports />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SidebarLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
