
import { useState } from "react";
import { MenuItem } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MenuManagerProps {
  menu: MenuItem[];
  onAddMenuItem: (item: Omit<MenuItem, "id">) => void;
  onRemoveMenuItem: (id: number) => void;
}

export function MenuManager({ menu, onAddMenuItem, onRemoveMenuItem }: MenuManagerProps) {
  const [newDishName, setNewDishName] = useState("");
  const [newDishPrice, setNewDishPrice] = useState("");

  const handleAdd = () => {
    if (!newDishName.trim() || isNaN(Number(newDishPrice))) return;
    onAddMenuItem({ name: newDishName.trim(), price: Number(newDishPrice) });
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
            <Button variant="ghost" size="sm" onClick={() => onRemoveMenuItem(item.id)}>x</Button>
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
        <Button variant="secondary" onClick={handleAdd}>Añadir Plato</Button>
      </div>
    </section>
  );
}
