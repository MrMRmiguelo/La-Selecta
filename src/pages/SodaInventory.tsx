import { SodaInventoryManager } from "@/components/admin/SodaInventoryManager";
import { RestaurantLayout } from "@/components/layout/RestaurantLayout";

export default function SodaInventoryPage() {
  return (
    <RestaurantLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Gestión de Inventario de Bebidas</h1>
        <SodaInventoryManager />
      </div>
    </RestaurantLayout>
  );
}