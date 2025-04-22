
import { ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

interface RestaurantLayoutProps {
  children: ReactNode;
}

// Default fallback values for development (you'll need to set these in your environment)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Check if the required environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL and Anon Key must be set in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
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
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Manager</h1>
          <LogoutButton />
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export { LogoutButton };
