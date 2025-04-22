
import { useState, useCallback } from "react";
import { TableProps } from "@/components/restaurant/Table";
import { MenuItem } from "@/types/restaurant";

export function useTables(defaultTables: TableProps[]) {
  const [tables, setTables] = useState<TableProps[]>(defaultTables);

  const updateTable = useCallback((tableUpdate: Partial<TableProps>) => {
    setTables(tables => tables.map(table => table.id === tableUpdate.id ? { ...table, ...tableUpdate } : table));
  }, []);

  const addTable = useCallback((number: number, capacity: number, shape: "round" | "square" | "rect") => {
    setTables(tables => {
      if (
        isNaN(number) ||
        isNaN(capacity) ||
        number <= 0 ||
        capacity <= 0 ||
        tables.some(t => t.number === number)
      ) {
        return tables;
      }
      const newId = tables.length ? Math.max(...tables.map(t => t.id)) + 1 : 1;
      return [
        ...tables,
        {
          id: newId,
          number,
          capacity,
          status: "free",
          shape
        }
      ];
    });
  }, []);

  const deleteTable = useCallback((tableId: number) => {
    setTables(tables => tables.filter(t => t.id !== tableId));
  }, []);

  const removeMenuItemInTables = useCallback((dishId: number) => {
    setTables(tables =>
      tables.map(table => ({
        ...table,
        food: table.food
          ? table.food.filter(fitem => fitem.itemId !== dishId)
          : table.food
      }))
    );
  }, []);

  return {
    tables,
    setTables,
    updateTable,
    addTable,
    deleteTable,
    removeMenuItemInTables
  };
}
