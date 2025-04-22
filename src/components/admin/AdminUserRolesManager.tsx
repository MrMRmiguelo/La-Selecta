
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type UserWithRole = {
  id: string;
  email: string | null;
  role: Database["public"]["Enums"]["app_role"];
};

export function AdminUserRolesManager() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [saving, setSaving] = useState<{ [userId: string]: boolean }>({});
  const [editedRoles, setEditedRoles] = useState<{ [userId: string]: Database["public"]["Enums"]["app_role"] }>({});

  // Cargar todos los usuarios con su rol actual
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      // 1. Obtener users desde Supabase Auth
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        toast({ title: "Error al listar usuarios", description: authError.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      // 2. Obtener roles desde la tabla user_roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rolesError) {
        toast({ title: "Error al cargar roles", description: rolesError.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      // 3. Unir ambos conjuntos de datos
      const usersWithRoles: UserWithRole[] = authUsers.map((u: any) => {
        const found = userRoles?.find((r: any) => r.user_id === u.id);
        return { id: u.id, email: u.email, role: found?.role ?? "normal" };
      });
      setUsers(usersWithRoles);
      setLoading(false);
    };

    fetchUsers();
  }, [toast]);

  // Al seleccionar un rol diferente
  const handleRoleChange = (userId: string, newRole: Database["public"]["Enums"]["app_role"]) => {
    setEditedRoles((prev) => ({ ...prev, [userId]: newRole }));
  };

  // Guardar el rol editado para un usuario
  const handleSaveRole = async (user: UserWithRole) => {
    setSaving((s) => ({ ...s, [user.id]: true }));
    const newRole = editedRoles[user.id] ?? user.role;

    // Actualizar en user_roles (upsert)
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: user.id, role: newRole });

    setSaving((s) => ({ ...s, [user.id]: false }));

    if (error) {
      toast({
        title: "Error al actualizar rol",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Rol actualizado",
        description: `El rol de ${user.email} es ahora "${newRole}"`,
        variant: "default",
      });
      // Refrescar UI
      setUsers((curr) =>
        curr.map((u) =>
          u.id === user.id ? { ...u, role: newRole } : u
        )
      );
      setEditedRoles((curr) => {
        const copy = { ...curr };
        delete copy[user.id];
        return copy;
      });
    }
  };

  return (
    <Card className="mb-8 max-w-2xl">
      <CardHeader>
        <CardTitle>Gestión de roles de usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  {loading ? "Cargando..." : "No hay usuarios"}
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <select
                    className="border rounded px-2 py-1"
                    value={editedRoles[user.id] ?? user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as Database["public"]["Enums"]["app_role"])}
                  >
                    <option value="normal">Normal</option>
                    <option value="admin">Admin</option>
                  </select>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    disabled={saving[user.id] || !editedRoles[user.id] || (editedRoles[user.id] === user.role)}
                    onClick={() => handleSaveRole(user)}
                  >
                    {saving[user.id] ? "Guardando..." : "Guardar"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
