import { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, 
  SidebarGroupLabel, SidebarGroupContent, SidebarMenu, 
  SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Home, Settings, CoinsIcon, GlassWater } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsKitchen } from "@/hooks/useIsKitchen";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { OrdersTable } from "@/components/restaurant/OrdersTable";

interface RestaurantLayoutProps {
  children: ReactNode;
}

function LogoutButton() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    // Cerrar la sesión usando el método simplificado de Supabase
    await signOut();
    navigate('/login');
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="ml-4"
      title="Cerrar sesión"
    >
      Cerrar sesión
    </Button>
  );
}

export const RestaurantLayout = ({ children }: RestaurantLayoutProps) => {
  const isAdmin = useIsAdmin();
  const isKitchen = useIsKitchen();
  const { email, role, loading } = useCurrentUserRole();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar isAdmin={isAdmin} isKitchen={isKitchen} />
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4" />
                
                <img src="/logo_la_selecta.png" alt="Logo" className="h-20" />
                
              
                
              </div>
              <div className="flex items-center gap-4">
                {!loading && email && (
                  <div className="flex flex-col items-end mr-2 text-right">
                    <span className="text-sm font-medium text-gray-800">{email}</span>
                    <span className="text-xs text-gray-500">{role === "admin" ? "Administrador" : role === "kitchen" ? "Cocina" : "Usuario"}</span>
                  </div>
                )}
                <LogoutButton />
              </div>
            </div>
          </header>
          <main className="flex-1">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {isKitchen ? (
                <div className="space-y-6">
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h2 className="text-xl font-bold mb-2 text-yellow-800">Comandas recibidas</h2>
                    <OrdersTable readOnly={true} />
                  </div>
                </div>
              ) : (
                children
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

function AppSidebar({ isAdmin, isKitchen }: { isAdmin: boolean, isKitchen?: boolean }) {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                  <Link to="/" className="w-full">
                    <Home />
                    <span>Inicio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {!isKitchen && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/kitchen"}>
                      <Link to="/kitchen" className="w-full">
                        <GlassWater />
                        <span>Cocina</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/user-settings"}>
                      <Link to="/user-settings" className="w-full">
                        <Settings />
                        <span>Ajustes de Usuario</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {isAdmin && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location.pathname === "/monthly-accounting"}>
                          <Link to="/monthly-accounting" className="w-full">
                            <CoinsIcon />
                            <span>Contabilidad</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location.pathname === "/soda-inventory"}>
                          <Link to="/soda-inventory" className="w-full">
                            <GlassWater />
                            <span>Inventario de Bebidas</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                  {isAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/admin"}>
                        <Link to="/admin" className="w-full">
                          <Users />
                          <span>Gestión de Usuarios</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export { LogoutButton };

// Eliminar el botón Dashboard
// Eliminar el botón Admin
