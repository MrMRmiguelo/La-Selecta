import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserRoleInfo {
  email: string | null;
  role: string | null;
  loading: boolean;
}

export function useCurrentUserRole(): UserRoleInfo {
  const [info, setInfo] = useState<UserRoleInfo>({ email: null, role: null, loading: true });

  useEffect(() => {
    let isMounted = true;
    async function fetchUserAndRole() {
      setInfo({ email: null, role: null, loading: true });
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || userError) {
        if (isMounted) setInfo({ email: null, role: null, loading: false });
        return;
      }
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      if (isMounted) {
        setInfo({
          email: user.email,
          role: roleData?.role || null,
          loading: false
        });
      }
    }
    fetchUserAndRole();
    return () => { isMounted = false; };
  }, []);

  return info;
}