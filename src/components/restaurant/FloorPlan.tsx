import { Table, TableProps } from "@/components/restaurant/Table";
import { Plus } from "lucide-react";

interface FloorPlanProps {
  tables: TableProps[];
  onTableSelect: (tableId: number) => void;
  onOpenAddTable: () => void;
}

export function FloorPlan({ tables, onTableSelect, onOpenAddTable }: FloorPlanProps) {
  return (
    <div className="bg-gray-100 p-6 rounded-lg relative">
      <h2 className="text-xl font-bold mb-6 text-gray-700">Plano del Restaurante</h2>
      <button
        onClick={onOpenAddTable}
        className="absolute right-8 top-6 z-20 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/80 transition"
        title="Añadir mesa"
        type="button"
      >
        <Plus size={22} />
      </button>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 relative min-h-[400px]">
        {tables.map((table) => (
          <div key={table.id} className="relative flex items-center justify-center">
            <Table {...table} onClick={onTableSelect} />
          </div>
        ))}
      </div>
    </div>
  );
}
