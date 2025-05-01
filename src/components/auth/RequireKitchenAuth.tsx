import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function RequireKitchenAuth({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isKitchen, setIsKitchen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    async function checkKitchenRole() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (!ignore) navigate("/login");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        if (!ignore) navigate("/login");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .single();

      if (!ignore) {
        if (roleData?.role === "kitchen") {
          setIsKitchen(true);
        } else {
          navigate("/");
        }
        setLoading(false);
      }
    }

    checkKitchenRole();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/login");
      }
    });

    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500">Cargando...</span>
      </div>
    );
  }

  if (!isKitchen) {
    return null;
  }

  return <>{children}</>;
}