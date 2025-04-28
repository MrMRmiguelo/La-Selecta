import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function UserSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Validación básica
    if (!currentPassword || !newPassword) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa ambos campos.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "La nueva contraseña debe tener al menos 6 caracteres.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }
    // Reautenticación y cambio de contraseña
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      toast({
        title: "Error de sesión",
        description: "No se pudo obtener la sesión actual.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }
    // Reautenticación: iniciar sesión de nuevo
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword
    });
    if (signInError) {
      toast({
        title: "Contraseña actual incorrecta",
        description: "La contraseña actual ingresada es incorrecta.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }
    // Cambiar contraseña
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({
        title: "Error al cambiar contraseña",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente.",
        variant: "default"
      });
      setCurrentPassword("");
      setNewPassword("");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Ajustes de Usuario</h2>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Contraseña actual</label>
          <Input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Ingresa tu contraseña actual"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Nueva contraseña</label>
          <Input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Nueva contraseña"
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Actualizando..." : "Cambiar contraseña"}
        </Button>
      </form>
    </div>
  );
}