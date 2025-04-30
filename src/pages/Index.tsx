import { useState, useEffect } from "react";
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

const DEFAULT_MENU: MenuItem[] = [
  { id: 1, name: "Milanesa", price: 7.5 },
  { id: 2, name: "Ensalada César", price: 5.0 },
  { id: 3, name: "Pizza Margarita", price: 8.0 },
];

const DEFAULT_TABLES: TableProps[] = [
  { id: 1, number: 1, capacity: 2, status: "free", shape: "round" },
  { id: 2, number: 2, capacity: 2, status: "free", shape: "round" },
  { id: 3, number: 3, capacity: 4, status: "occupied", shape: "square", customer: { name: "Martínez", partySize: 3 }, occupiedAt: new Date(Date.now() - 30 * 60 * 1000), food: [] },
  { id: 4, number: 4, capacity: 4, status: "occupied", shape: "square", customer: { name: "Rodríguez", partySize: 4 }, occupiedAt: new Date(Date.now() - 45 * 60 * 1000), food: [] },
  { id: 5, number: 5, capacity: 6, status: "reserved", shape: "rect", customer: { name: "López", partySize: 5 }, food: [] },
  { id: 6, number: 6, capacity: 6, status: "free", shape: "rect" },
  { id: 7, number: 7, capacity: 2, status: "free", shape: "round" },
  { id: 8, number: 8, capacity: 2, status: "free", shape: "round" },
  { id: 9, number: 9, capacity: 4, status: "free", shape: "square" },
  { id: 10, number: 10, capacity: 4, status: "reserved", shape: "square", customer: { name: "Fernández", partySize: 4 }, food: [] },
  { id: 11, number: 11, capacity: 8, status: "occupied", shape: "rect", customer: { name: "González", partySize: 7 }, occupiedAt: new Date(Date.now() - 15 * 60 * 1000), food: [] },
  { id: 12, number: 12, capacity: 8, status: "free", shape: "rect" },
];

const Index = () => {
  const [selectedTable, setSelectedTable] = useState<TableProps | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [addTableOpen, setAddTableOpen] = useState(false);
  const isAdmin = useIsAdmin();

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
  } = useTables(DEFAULT_TABLES);

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
    const { data, error } = await supabase.from("menu").insert(item).select();
    if (!error && data && data.length > 0) {
      setMenu(menu => [...menu, data[0]]);
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Delicias La Selecta</h1>
            <p className="text-gray-500"></p>
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

        {isAdmin && (
          <MenuManager
            menu={menu}
            onAddMenuItem={handleAddMenuItem}
            onRemoveMenuItem={handleRemoveMenuItem}
          />
        )}

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
