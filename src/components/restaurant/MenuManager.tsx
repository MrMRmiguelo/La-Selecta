
import React, { useState } from "react";
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

export function MenuManager({ menu }: { menu: MenuItem[] }) {
  // Agrupar el menú por tipo de cocina
  const groupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.tipo_cocina]) {
      acc[item.tipo_cocina] = [];
    }
    acc[item.tipo_cocina].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Menú del día</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(groupedMenu).map(([kitchen, items]) => (
          <div key={kitchen} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-sm text-gray-700 mb-2 capitalize">{kitchen}</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="bg-white px-3 py-2 rounded text-sm flex justify-between items-center">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600">L {item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {menu.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>No hay platos disponibles en el menú.</p>
          <p className="text-sm">Los administradores pueden agregar platos desde la sección "Gestión del Menú".</p>
        </div>
      )}
    </section>
  );
}
