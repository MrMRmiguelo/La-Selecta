import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/utils/authTimeout";
import { useToast } from "@/components/ui/use-toast";

export function useIsKitchen() {
  const [isKitchen, setIsKitchen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    async function checkKitchenRole() {
      try {
        // Obtener usuario con timeout
        const { data } = await withTimeout(supabase.auth.getUser());
        const userId = data.user?.id;
        
        if (!userId) {
          if (isMounted) {
            setIsKitchen(false);
            setLoading(false);
          }
          return;
        }

        try {
          // Consultar en user_roles si es kitchen con timeout
          const { data: roleData, error } = await withTimeout(
            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", userId)
              .single()
          );
          
          if (isMounted) {
            if (error) {
              setIsKitchen(false);
            } else {
              setIsKitchen(roleData.role === "kitchen");
            }
            setLoading(false);
          }
        } catch (error) {
          console.error("Error al verificar rol de cocina:", error);
          if (isMounted) {
            setIsKitchen(false);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error en la autenticación:", error);
        if (isMounted) {
          setIsKitchen(false);
          setLoading(false);
        }
      }
    }

    checkKitchenRole();
    
    return () => { isMounted = false; };
  }, [toast]);

  return isKitchen;
}