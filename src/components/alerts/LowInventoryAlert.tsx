import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { supabase } from "@/integrations/supabase/client";
import { SodaInventory } from "@/types/soda";

interface LowInventoryAlertProps {
  threshold?: number; // Umbral para considerar inventario bajo
}

export function LowInventoryAlert({ threshold = 10 }: LowInventoryAlertProps) {
  const [lowInventoryItems, setLowInventoryItems] = useState<SodaInventory[]>([]);
  const [criticalItems, setCriticalItems] = useState<SodaInventory[]>([]);

  useEffect(() => {
    const fetchLowInventory = async () => {
      const { data: lowData, error: lowError } = await supabase
        .from("soda_inventory")
        .select("*")
        .lt("quantity", threshold)
        .neq("quantity", 5);

      const { data: criticalData, error: criticalError } = await supabase
        .from("soda_inventory")
        .select("*")
        .eq("quantity", 5);

      if (!lowError && lowData) {
        setLowInventoryItems(lowData);
      }

      if (!criticalError && criticalData) {
        setCriticalItems(criticalData);
      }
    };

    fetchLowInventory();

    // Suscribirse a cambios en el inventario
    const subscription = supabase
      .channel('low_inventory_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'soda_inventory' }, 
        () => fetchLowInventory()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [threshold]);

  if (lowInventoryItems.length === 0 && criticalItems.length === 0) return null;

  return (
    <div className="space-y-2">
      {criticalItems.map((item) => (
        <Alert variant="destructive" key={item.id} className="border-2 border-red-600">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>¡Atención! Inventario Crítico</AlertTitle>
          <AlertDescription>
            La bebida {item.name} tiene exactamente 5 unidades restantes. ¡Necesita reabastecimiento inmediato!
          </AlertDescription>
        </Alert>
      ))}
      {lowInventoryItems.map((item) => (
        <Alert variant="destructive" key={item.id}>
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Inventario Bajo</AlertTitle>
          <AlertDescription>
            La bebida {item.name} tiene un inventario bajo ({item.quantity} unidades restantes).
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}