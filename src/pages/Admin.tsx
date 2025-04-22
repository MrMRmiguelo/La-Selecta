
import { AdminUserCreation } from "@/components/admin/AdminUserCreation";
import { AdminUserRolesManager } from "@/components/admin/AdminUserRolesManager";
import { RestaurantLayout } from "@/components/layout/RestaurantLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Admin() {
  return (
    <RestaurantLayout>
      <div className="p-6 space-y-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
          <p className="text-gray-500">Gestión de usuarios y roles del sistema</p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Administración de Usuarios</CardTitle>
            <CardDescription>Gestiona los usuarios y roles del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AdminUserCreation />
            <AdminUserRolesManager />
          </CardContent>
        </Card>
      </div>
    </RestaurantLayout>
  );
}
