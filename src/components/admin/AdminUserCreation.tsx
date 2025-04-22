
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_PASSWORD = "CambiaEsta123!"; // Por seguridad, notificar que debe cambiarla tras el primer login

export function AdminUserCreation() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Crear usuario desde el backend (supabase.auth.admin.createUser está solo disponible vía server, por eso usamos edge function)
    const response = await fetch("/api/create-user", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        email,
        password: DEFAULT_PASSWORD,
        role: "normal"
      })
    });

    setLoading(false);
    const result = await response.json();
    if (result.error) {
      toast({
        title: "Error al crear usuario",
        description: result.error,
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Usuario creado correctamente",
      description: `Usuario ${email} creado con rol normal. Contraseña inicial: ${DEFAULT_PASSWORD}`,
      variant: "default"
    });
    setEmail("");
  };

  return (
    <Card className="mb-8 max-w-md">
      <CardHeader>
        <CardTitle>Alta de usuario (solo admin)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateUser} className="flex gap-2 items-center">
          <Input
            type="email"
            placeholder="email usuario"
            value={email}
            autoComplete="off"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading || !email}>
            {loading ? "Creando..." : "Crear"}
          </Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          El usuario recibirá la contraseña <b>{DEFAULT_PASSWORD}</b>, ¡recomiéndale cambiarla!
        </p>
      </CardContent>
    </Card>
  );
}
