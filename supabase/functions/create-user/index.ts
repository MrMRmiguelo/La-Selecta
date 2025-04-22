
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = "https://ivuibzedbnbndoyfpfrz.supabase.co";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada en secrets");
    }
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { email, password, role } = await req.json();

    // 1. Crear usuario Auth
    const { data: userCreate, error: userErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (userErr || !userCreate.user) {
      console.log(userErr);
      return new Response(JSON.stringify({ error: userErr.message }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // 2. Insertar rol en user_roles
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert([
        { user_id: userCreate.user.id, role }
      ]);

    if (roleErr) {
      console.log(roleErr);
      return new Response(JSON.stringify({ error: roleErr.message }), {
        status: 400,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (e) {
    console.log("ERROR CREATE USER", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: corsHeaders
    });
  }
});
