import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/theme-provider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RequireKitchenAuth } from "./components/auth/RequireKitchenAuth";
import { ConnectionCheck } from "./components/auth/ConnectionCheck";
import SodaInventory from "./pages/SodaInventory";
import UserSettings from "./pages/UserSettings";
import MonthlyAccountingPage from "./pages/MonthlyAccountingPage";
import Kitchen from "./pages/Kitchen";
import { RestaurantLayout } from "./components/layout/RestaurantLayout";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          {/* Componente para verificar la conexión con Supabase */}
          <ConnectionCheck />
          
          <Routes>
            <Route path="/kitchen" element={
              <RequireKitchenAuth>
                <Kitchen />
              </RequireKitchenAuth>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />

            {/* Rutas protegidas */}
            <Route path="/" element={
              <RequireAuth>
                <Index />
              </RequireAuth>
            } />
            <Route path="/admin" element={
              <RequireAuth>
                <Admin />
              </RequireAuth>
            } />
            <Route path="/soda-inventory" element={
              <RequireAuth>
                <SodaInventory />
              </RequireAuth>
            } />
            <Route path="/restaurant" element={
              <RequireAuth>
                <Index />
              </RequireAuth>
            } />
            <Route path="/monthly-accounting" element={
              <RequireAuth>
                <MonthlyAccountingPage />
              </RequireAuth>
            } />
            <Route path="/user-settings" element={
              <RequireAuth>
                <UserSettings />
              </RequireAuth>
            } />
            {/* Ruta de sesiones múltiples eliminada */}
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
