
import { useState } from "react";
import { RestaurantLayout } from "@/components/layout/RestaurantLayout";
import { FloorPlan } from "@/components/restaurant/FloorPlan";
import { Dashboard } from "@/components/restaurant/Dashboard";
import { TableDialog } from "@/components/restaurant/TableDialog";
import { TableProps } from "@/components/restaurant/Table";
import { MenuItem, TableFoodItem } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const DEFAULT_MENU: MenuItem[] = [
  { id: 1, name: "Milanesa", price: 7.5 },
  { id: 2, name: "Ensalada César", price: 5.0 },
  { id: 3, name: "Pizza Margarita", price: 8.0 },
];

const Index = () => {
  const [selectedTable, setSelectedTable] = useState<TableProps | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tables, setTables] = useState<TableProps[]>([
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
  ]);
  const [menu, setMenu] = useState<MenuItem[]>(DEFAULT_MENU);

  // Estados para añadir nuevos platos al menú
  const [newDishName, setNewDishName] = useState("");
  const [newDishPrice, setNewDishPrice] = useState("");

  // Nuevo: Estados para añadir mesas
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("");
  const [newTableShape, setNewTableShape] = useState<"round" | "square" | "rect">("round");

  // Contabilidad diaria
  const [dailyTotal, setDailyTotal] = useState(0);

  const handleTableSelect = (tableId: number) => {
    const table = tables.find(t => t.id === tableId) || null;
    setSelectedTable(table);
    setDialogOpen(true);
  };

  // Actualizar mesa, sumar a contabilidad si corresponde
  const handleUpdateTable = (tableUpdate: Partial<TableProps>, totalToAccount?: number) => {
    setTables(tables.map(table => 
      table.id === tableUpdate.id ? { ...table, ...tableUpdate } : table
    ));
    if (totalToAccount && totalToAccount > 0) {
      setDailyTotal(prev => prev + totalToAccount);
    }
  };

  // Añadir plato nuevo al menú
  const handleAddMenuItem = () => {
    if (!newDishName.trim() || isNaN(Number(newDishPrice))) return;
    setMenu([
      ...menu,
      {
        id: menu.length ? Math.max(...menu.map(m => m.id)) + 1 : 1,
        name: newDishName.trim(),
        price: Number(newDishPrice)
      }
    ]);
    setNewDishName("");
    setNewDishPrice("");
  };

  // Eliminar plato del menú (sólo para la gestión manual)
  const handleRemoveMenuItem = (dishId: number) => {
    setMenu(menu.filter(item => item.id !== dishId));
    // Además, elimina ese plato (si existe) de las mesas activas.
    setTables(
      tables.map(table => ({
        ...table,
        food: table.food
          ? table.food.filter(fitem => fitem.itemId !== dishId)
          : table.food
      }))
    );
  };

  // Añadir nueva mesa
  const handleAddTable = () => {
    const number = parseInt(newTableNumber, 10);
    const capacity = parseInt(newTableCapacity, 10);
    if (
      isNaN(number) ||
      isNaN(capacity) ||
      number <= 0 ||
      capacity <= 0 ||
      tables.some(t => t.number === number)
    ) {
      return; // No permite datos inválidos o duplicados
    }
    const newId = tables.length ? Math.max(...tables.map(t => t.id)) + 1 : 1;
    setTables([
      ...tables,
      {
        id: newId,
        number,
        capacity,
        status: "free",
        shape: newTableShape
      }
    ]);
    setNewTableNumber("");
    setNewTableCapacity("");
    setNewTableShape("round");
  };

  return (
    <RestaurantLayout>
      <div className="p-6 space-y-6">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Restaurant Mesa Manager</h1>
            <p className="text-gray-500">Gestiona fácilmente las mesas de tu restaurante</p>
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

        <section>
          <h2 className="text-lg font-semibold mb-2">Menú del día</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {menu.map((item) =>
              <span key={item.id} className="bg-gray-200 px-3 py-1 rounded text-sm flex items-center gap-2">
                <span>{item.name} <span className="text-gray-500">(L {item.price.toFixed(2)})</span></span>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveMenuItem(item.id)}>x</Button>
              </span>
            )}
          </div>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Nombre plato"
              value={newDishName}
              onChange={e => setNewDishName(e.target.value)}
              className="w-44"
            />
            <Input
              placeholder="Precio"
              value={newDishPrice}
              onChange={e => setNewDishPrice(e.target.value.replace(",", "."))}
              type="number"
              step="0.01"
              className="w-32"
            />
            <Button variant="secondary" onClick={handleAddMenuItem}>Añadir Plato</Button>
          </div>
        </section>

        {/* NUEVO: Formulario para agregar mesas */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Añadir Mesa</h2>
          <div className="flex gap-2 flex-wrap items-center">
            <Input
              placeholder="Número de mesa"
              value={newTableNumber}
              onChange={e => setNewTableNumber(e.target.value.replace(/\D/, ""))}
              className="w-32"
              type="number"
              min={1}
            />
            <Input
              placeholder="Capacidad"
              value={newTableCapacity}
              onChange={e => setNewTableCapacity(e.target.value.replace(/\D/, ""))}
              className="w-32"
              type="number"
              min={1}
            />
            <Select
              value={newTableShape}
              onValueChange={v => setNewTableShape(v as "round" | "square" | "rect")}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Forma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round">Redonda</SelectItem>
                <SelectItem value="square">Cuadrada</SelectItem>
                <SelectItem value="rect">Rectangular</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={handleAddTable}>Añadir Mesa</Button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            El número de mesa no puede repetirse. La forma afecta cómo se representa en el plano.
          </div>
        </section>

        <Dashboard tables={tables} dailyTotal={dailyTotal} />
        
        <div className="mt-8">
          <FloorPlan 
            tables={tables} 
            onTableSelect={handleTableSelect} 
          />
        </div>
      </div>

      <TableDialog 
        table={selectedTable} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onUpdateTable={handleUpdateTable}
        menu={menu}
      />
    </RestaurantLayout>
  );
};

export default Index;
