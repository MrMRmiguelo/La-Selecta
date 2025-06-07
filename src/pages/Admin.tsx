
import { AdminUserCreation } from "@/components/admin/AdminUserCreation";
import { AdminUserRolesManager } from "@/components/admin/AdminUserRolesManager";
import { RestaurantLayout } from "@/components/layout/RestaurantLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Admin() {
  return (
    <RestaurantLayout>
      <div className="space-y-8">


        <Card>
          <CardHeader>
            <CardTitle>Panel de Administración</CardTitle>
            <CardDescription>
              Gestiona usuarios, roles y configuraciones del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Utiliza las herramientas a continuación para administrar el sistema.
            </p>
          </CardContent>
        </Card>
        
        <AdminUserCreation />
        <AdminUserRolesManager />
      </div>
    </RestaurantLayout>
  );
}
