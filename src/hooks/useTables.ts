
import { useState, useCallback, useEffect } from "react";
import { TableProps } from "@/components/restaurant/Table";
import { supabase } from "@/integrations/supabase/client";

export function useTables(defaultTables: TableProps[]) {
  const [tables, setTables] = useState<TableProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchTables() {
      setLoading(true);
      const { data, error } = await supabase.from("tables").select("*").order("number");
      if (!error && data) {
        if (isMounted) {
          setTables(data.map((row: any) => ({
            ...row,
            customer: row.customer || undefined,
            food: row.food || [],
            sodaOrder: row.soda_order || [],
            occupiedAt: row.occupied_at ? new Date(row.occupied_at) : undefined
          })));
        }
      } else {
        if (isMounted) setTables(defaultTables);
      }
      if (isMounted) setLoading(false);
    }
    fetchTables();
    return () => { isMounted = false; };
  }, []);

  const updateTable = useCallback(async (tableUpdate: Partial<TableProps>) => {
    setTables(tables => tables.map(table => table.id === tableUpdate.id ? { ...table, ...tableUpdate } : table));
    // Actualiza en Supabase
    const { id, customer, food, sodaOrder, occupiedAt, ...rest } = tableUpdate;
    // Construir el objeto solo con los campos válidos y nombres correctos
    const updateObj: any = { ...rest };
    if (typeof customer !== "undefined") updateObj.customer = customer ? customer : null;
    if (typeof food !== "undefined") updateObj.food = food ? food : [];
    if (typeof sodaOrder !== "undefined") updateObj.soda_order = sodaOrder ? sodaOrder : [];
    if (typeof occupiedAt !== "undefined") updateObj.occupied_at = occupiedAt ? occupiedAt : null;
    await supabase.from("tables").update(updateObj).eq("id", id);
    // Refresca los datos desde la base de datos para asegurar que la tabla se actualice correctamente
    const { data, error } = await supabase.from("tables").select("*").order("number");
    if (!error && data) {
      setTables(data.map((row: any) => ({
        ...row,
        customer: row.customer || undefined,
        food: row.food || [],
        sodaOrder: row.soda_order || [],
        occupiedAt: row.occupied_at ? new Date(row.occupied_at) : undefined
      })));
    }
  }, []);

  const addTable = useCallback(async (number: number, capacity: number, shape: "round" | "square" | "rect") => {
    // Inserta en Supabase
    const { data, error } = await supabase.from("tables").insert({
      number,
      capacity,
      status: "free",
      shape
    }).select();
    if (!error && data && data.length > 0) {
      setTables(tables => [...tables, data[0]]);
    }
  }, []);

  const deleteTable = useCallback(async (tableId: number) => {
    setTables(tables => tables.filter(t => t.id !== tableId));
    await supabase.from("tables").delete().eq("id", tableId);
  }, []);

  const removeMenuItemInTables = useCallback(async (dishId: number) => {
    setTables(tables =>
      tables.map(table => ({
        ...table,
        food: table.food
          ? table.food.filter(fitem => fitem.id !== dishId)
          : table.food
      }))
    );
    // Opcional: actualizar todas las mesas en Supabase
    // (esto puede optimizarse según la lógica de negocio)
  }, []);

  return {
    tables,
    setTables,
    updateTable,
    addTable,
    deleteTable,
    removeMenuItemInTables,
    loading
  };
}
