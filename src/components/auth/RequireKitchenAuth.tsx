import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { AUTH_TIMEOUT_MS } from "@/utils/authTimeout";

export function RequireKitchenAuth({ children }: { children: React.ReactNode }) {
  const { currentSession, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Si no hay sesión activa, redirigir al login
    if (!authLoading && !currentSession) {
      navigate("/login");
      return;
    }

    // Si hay sesión, verificar si tiene permisos de cocina
    if (!authLoading && currentSession) {
      const userRole = currentSession.role;
      
      // Admin tiene acceso completo a todas las áreas incluyendo cocina
      if (!userRole || (userRole !== "kitchen" && userRole !== "admin")) {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos para acceder a la cocina.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      
      setIsAuthorized(true);
      setLoading(false);
    }

    // Implementar un timeout para evitar carga infinita
    let timeoutId: NodeJS.Timeout;
    
    if (loading || authLoading) {
      timeoutId = setTimeout(() => {
        setTimeoutOccurred(true);
        setLoading(false);
        toast({
          title: "Error de carga",
          description: "La verificación de permisos está tardando demasiado. Por favor, recarga la página o inicia sesión nuevamente.",
          variant: "destructive",
        });
        navigate("/login");
      }, AUTH_TIMEOUT_MS);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentSession, authLoading, loading, navigate, toast]);

  if ((loading || authLoading) && !timeoutOccurred) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <span className="text-gray-500">Cargando...</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}