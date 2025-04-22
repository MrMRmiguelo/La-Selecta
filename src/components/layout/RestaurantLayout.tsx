
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoveHorizontal, Home, BarChart3, Settings } from "lucide-react";

type RestaurantLayoutProps = {
  children: React.ReactNode;
};

export function RestaurantLayout({ children }: RestaurantLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`bg-white shadow-md transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-restaurant-accent">RestaurantHub</h1>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto"
          >
            <MoveHorizontal size={20} />
          </Button>
        </div>
        
        <nav className="flex-1 p-2">
          <ul className="space-y-2">
            <li>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-4"}`}
              >
                <Home size={20} />
                {!sidebarCollapsed && <span className="ml-3">Inicio</span>}
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-4"}`}
              >
                <BarChart3 size={20} />
                {!sidebarCollapsed && <span className="ml-3">Estadísticas</span>}
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-4"}`}
              >
                <Settings size={20} />
                {!sidebarCollapsed && <span className="ml-3">Configuración</span>}
              </Button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
