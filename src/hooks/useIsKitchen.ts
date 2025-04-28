import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsKitchen() {
  const [isKitchen, setIsKitchen] = useState(false);

  useEffect(() => {
    let userId: string | undefined;
    supabase.auth.getUser().then(({ data }) => {
      userId = data.user?.id;
      if (!userId) return setIsKitchen(false);

      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single()
        .then(({ data, error }) => {
          if (error) return setIsKitchen(false);
          setIsKitchen(data.role === "kitchen");
        });
    });
  }, []);

  return isKitchen;
}