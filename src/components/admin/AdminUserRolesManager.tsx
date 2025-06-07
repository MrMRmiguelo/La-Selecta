
import React from "react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/supabase";



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
      try {
        // Obtener todos los usuarios de auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error('Error al cargar usuarios:', authError);
          toast({ 
            title: "Error al cargar usuarios", 
            description: "No se pudieron cargar los usuarios. Verifica la conexión a la base de datos.", 
            variant: "destructive" 
          });
          setLoading(false);
          return;
        }

        // Si no hay usuarios, mostrar mensaje informativo
        if (!authUsers || authUsers.users.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        // Obtener roles desde la tabla user_roles
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("user_id, role");
        
        // Crear un mapa de roles para búsqueda rápida
        const rolesMap = new Map();
        if (userRoles && !rolesError) {
          userRoles.forEach((roleData: any) => {
            rolesMap.set(roleData.user_id, roleData.role);
          });
        }

        // Crear lista de usuarios con sus roles
        const usersWithRoles: UserWithRole[] = authUsers.users.map((user: any) => {
          return { 
            id: user.id, 
            email: user.email || `Usuario ${user.id.substring(0, 8)}...`,
            role: rolesMap.get(user.id) || "normal" 
          };
        });
        
        setUsers(usersWithRoles);
      } catch (error) {
        console.error('Error inesperado:', error);
        toast({ 
          title: "Error inesperado", 
          description: "Ocurrió un error al cargar los usuarios.", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
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
                    <option value="kitchen">Kitchen</option>
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
