
import { Table, TableProps } from "@/components/restaurant/Table";

interface FloorPlanProps {
  tables: TableProps[];
  onTableSelect: (tableId: number) => void;
}

export function FloorPlan({ tables, onTableSelect }: FloorPlanProps) {
  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-6 text-gray-700">Plano del Restaurante</h2>
      
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 relative min-h-[400px]">
        {tables.map((table) => (
          <div key={table.id} className="flex items-center justify-center">
            <Table {...table} onClick={onTableSelect} />
          </div>
        ))}
      </div>
    </div>
  );
}
