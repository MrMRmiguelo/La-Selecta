
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_PASSWORD = "Selecta123"; // Contraseña inicial para nuevos usuarios

export function AdminUserCreation() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Llamar directamente a la función de Edge Function de Supabase
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email,
          password: DEFAULT_PASSWORD,
          role: "normal"
        }
      });

      if (error) {
        toast({
          title: "Error al crear usuario",
          description: error.message,
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
    } catch (error) {
      console.error("Error al crear usuario:", error);
      toast({
        title: "Error al crear usuario",
        description: "Ha ocurrido un error al crear el usuario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
