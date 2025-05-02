
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/utils/authTimeout";
import { useToast } from "@/components/ui/use-toast";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    async function checkAdminRole() {
      try {
        // Obtener usuario con timeout
        const { data } = await withTimeout(supabase.auth.getUser());
        const userId = data.user?.id;
        
        if (!userId) {
          if (isMounted) {
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }

        try {
          // Consultar en user_roles si es admin con timeout
          const { data: roleData, error } = await withTimeout(
            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", userId)
              .single()
          );
          
          if (isMounted) {
            if (error) {
              setIsAdmin(false);
            } else {
              setIsAdmin(roleData.role === "admin");
            }
            setLoading(false);
          }
        } catch (error) {
          console.error("Error al verificar rol de admin:", error);
          if (isMounted) {
            setIsAdmin(false);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error en la autenticación:", error);
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    }

    checkAdminRole();
    
    return () => { isMounted = false; };
  }, [toast]);

  return isAdmin;
}
