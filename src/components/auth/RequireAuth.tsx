
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { AUTH_TIMEOUT_MS } from "@/utils/authTimeout";
import { supabase } from "@/integrations/supabase/client";

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { currentSession, loading, getUserRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);

  useEffect(() => {
    // Verificar autenticación y roles
    if (!loading) {
      if (!currentSession) {
        navigate('/login', { state: { from: location } });
      } else if (allowedRoles) {
        const userRole = getUserRole();
        if (!userRole || !allowedRoles.includes(userRole)) {
          toast({
            title: 'Acceso denegado',
            description: 'No tienes permisos para acceder a esta página',
            variant: 'destructive',
          });
          navigate('/', { replace: true });
        }
      }
    }

    // Implementar un timeout para evitar carga infinita
    let timeoutId: NodeJS.Timeout;
    
    if (loading) {
      timeoutId = setTimeout(() => {
        setTimeoutOccurred(true);
        toast({
          title: "Error de carga",
          description: "La autenticación está tardando demasiado. Por favor, recarga la página o inicia sesión nuevamente.",
          variant: "destructive",
        });
        navigate("/login");
      }, AUTH_TIMEOUT_MS);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentSession, loading, navigate, toast, location]);

  if (loading && !timeoutOccurred) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <span className="text-gray-500">Cargando...</span>
      </div>
    );
  }

  if (!currentSession) {
    return null;
  }

  return <>{children}</>;
}

