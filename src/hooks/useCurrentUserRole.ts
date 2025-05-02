import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/utils/authTimeout";
import { useToast } from "@/components/ui/use-toast";

interface UserRoleInfo {
  email: string | null;
  role: string | null;
  loading: boolean;
}

export function useCurrentUserRole(): UserRoleInfo {
  const [info, setInfo] = useState<UserRoleInfo>({ email: null, role: null, loading: true });
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    async function fetchUserAndRole() {
      setInfo({ email: null, role: null, loading: true });
      try {
        // Obtener usuario con timeout
        const { data: userData, error: userError } = await withTimeout(supabase.auth.getUser());
        const user = userData.user;
        
        if (!user || userError) {
          if (isMounted) {
            setInfo({ email: null, role: null, loading: false });
            if (userError) {
              toast({
                title: "Error de autenticación",
                description: "No se pudo obtener la información del usuario.",
                variant: "destructive",
              });
            }
          }
          return;
        }

        try {
          // Obtener rol con timeout
          const { data: roleData, error: roleError } = await withTimeout(
            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", user.id)
              .single()
          );

          if (isMounted) {
            setInfo({
              email: user.email,
              role: roleData?.role || null,
              loading: false
            });
          }
        } catch (roleError) {
          console.error("Error al obtener el rol:", roleError);
          if (isMounted) {
            setInfo({
              email: user.email,
              role: null,
              loading: false
            });
            toast({
              title: "Advertencia",
              description: "No se pudo obtener el rol del usuario. Algunas funciones pueden estar limitadas.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error en la autenticación:", error);
        if (isMounted) {
          setInfo({ email: null, role: null, loading: false });
          toast({
            title: "Error de conexión",
            description: "No se pudo conectar con el servidor. Por favor, recarga la página.",
            variant: "destructive",
          });
        }
      }
    }

    fetchUserAndRole();
    
    return () => { 
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [toast]);

  return info;
}