import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RestaurantLayout } from "@/components/layout/RestaurantLayout";
import { FloorPlan } from "@/components/restaurant/FloorPlan";
import { Dashboard } from "@/components/restaurant/Dashboard";
import { TableDialog } from "@/components/restaurant/TableDialog";
import { TableProps } from "@/components/restaurant/Table";
import { MenuItem } from "@/types/restaurant";
import { AddTableDialog } from "@/components/restaurant/AddTableDialog";
import { MenuManager } from "@/components/restaurant/MenuManager";
import { useTables } from "@/hooks/useTables";
import { useDailyTotal } from "@/hooks/useDailyTotal";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { LowInventoryAlert } from "@/components/alerts/LowInventoryAlert";
import { useToast } from "@/hooks/use-toast"; // Importar useToast





const Index = () => {
  const [selectedTable, setSelectedTable] = useState<TableProps | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [addTableOpen, setAddTableOpen] = useState(false);
  const isAdmin = useIsAdmin();
  const { toast } = useToast(); // Obtener la función toast

  useEffect(() => {
    async function fetchMenu() {
      const { data, error } = await supabase.from("menu").select("*").order("id");
      if (!error && data) setMenu(data);
    }
    fetchMenu();
  }, []);
  const {
    tables,
    setTables,
    updateTable,
    addTable,
    deleteTable,
    removeMenuItemInTables,
  } = useTables();

  const { dailyTotal, addToDailyTotal } = useDailyTotal();

  const handleTableSelect = (tableId: number) => {
    const table = tables.find(t => t.id === tableId) || null;
    setSelectedTable(table);
    setDialogOpen(true);
  };

  // Ajustar la firma para incluir isPayment y eliminar el parámetro totalToAccount que ya no se usa aquí
  const handleUpdateTable = (tableUpdate: Partial<TableProps>, totalAmount: number, isPayment: boolean) => {
    // Pasar isPayment a updateTable. La lógica de addToDailyTotal ahora está en TableDialog.
    updateTable(tableUpdate);
  };

  const handleAddMenuItem = async (item: Omit<MenuItem, "id">) => {
    console.log("[DEBUG] Intentando agregar plato:", item);
    const { data, error } = await supabase.from("menu").insert(item).select();
    console.log("[DEBUG] Respuesta de Supabase:", { data, error });
    
    if (error) {
      console.error("[DEBUG] Error al agregar plato:", error);
      toast({ // Ahora toast está definido
        title: "Error al agregar plato",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    if (data && data.length > 0) {
      console.log("[DEBUG] Plato agregado exitosamente:", data[0]);
      setMenu(menu => [...menu, data[0]]);
      toast({ // Ahora toast está definido
        title: "Plato agregado",
        description: `${item.name} ha sido agregado al menú.`
      });
    }
  };

  const handleRemoveMenuItem = async (dishId: number) => {
    const { error } = await supabase.from("menu").delete().eq("id", dishId);
    if (!error) {
      setMenu(menu => menu.filter(item => item.id !== dishId));
      removeMenuItemInTables(dishId);
    }
  };

  return (
    <RestaurantLayout>
      <div className="p-6 space-y-6">
        <header className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">Delicias La Selecta</h1>
            <LowInventoryAlert threshold={5} />
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </header>

        <Dashboard tables={tables} dailyTotal={dailyTotal} />

        <div className="mt-8">
          <FloorPlan 
            tables={tables} 
            onTableSelect={handleTableSelect}
            onDeleteTable={deleteTable}
            onOpenAddTable={() => setAddTableOpen(true)}
          />
        </div>
      </div>

      <TableDialog
        table={selectedTable}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdateTable={handleUpdateTable}
        onDeleteTable={deleteTable}
        menu={menu}
        updateDailyTotal={addToDailyTotal} // Pasar la función para actualizar el total
      />

      <AddTableDialog
        open={addTableOpen}
        onOpenChange={setAddTableOpen}
        onAdd={addTable}
      />
    </RestaurantLayout>
  );
};

export default Index;
