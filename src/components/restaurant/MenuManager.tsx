
import { useState } from "react";
import { MenuItem } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MenuManagerProps {
  menu: MenuItem[];
  onAddMenuItem: (item: Omit<MenuItem, "id">) => void;
  onRemoveMenuItem: (id: number) => void;
}

export function MenuManager({ menu, onAddMenuItem, onRemoveMenuItem }: MenuManagerProps) {
  const [newDishName, setNewDishName] = useState("");
  const [newDishPrice, setNewDishPrice] = useState("");
  const [selectedKitchen, setSelectedKitchen] = useState<'buffet' | 'cocina adentro' | 'cocina afuera'>('buffet');
  const isAdmin = useIsAdmin();

  const handleAdd = () => {
    if (!newDishName.trim() || isNaN(Number(newDishPrice))) return;
    onAddMenuItem({ 
      name: newDishName.trim(), 
      price: Number(newDishPrice),
      tipo_cocina: selectedKitchen
    });
    setNewDishName("");
    setNewDishPrice("");
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">Menú del día</h2>
      <div className="flex flex-wrap gap-2 mb-2">
        {menu.map((item) =>
          <span key={item.id} className="bg-gray-200 px-3 py-1 rounded text-sm flex items-center gap-2">
            <span>{item.name} <span className="text-gray-500">(L {item.price.toFixed(2)})</span></span>
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => onRemoveMenuItem(item.id)}>x</Button>
            )}
          </span>
        )}
      </div>
      {isAdmin && (
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
          <Select
            value={selectedKitchen}
            onValueChange={(value: 'buffet' | 'cocina adentro' | 'cocina afuera') => setSelectedKitchen(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Seleccionar cocina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buffet">Buffet</SelectItem>
              <SelectItem value="cocina adentro">Cocina Adentro</SelectItem>
              <SelectItem value="cocina afuera">Cocina Afuera</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={handleAdd}>Añadir Plato</Button>
        </div>
      )}
    </section>
  );
}
