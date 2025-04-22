
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let userId: string | undefined;
    supabase.auth.getUser().then(({ data }) => {
      userId = data.user?.id;
      if (!userId) return setIsAdmin(false);

      // Consultar en user_roles si es admin
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single()
        .then(({ data, error }) => {
          if (error) return setIsAdmin(false);
          setIsAdmin(data.role === "admin");
        });
    });
  }, []);

  return isAdmin;
}
