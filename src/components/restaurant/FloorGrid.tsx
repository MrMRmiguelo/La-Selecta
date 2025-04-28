
import { Table, TableProps } from "@/components/restaurant/Table";

interface FloorGridProps {
  tables: TableProps[];
  onTableSelect: (tableId: number) => void;
}

export function FloorGrid({ tables, onTableSelect }: FloorGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 relative min-h-[300px] sm:min-h-[400px] w-full max-w-full px-2">
      {tables.map((table) => (
        <div key={table.id} className="relative flex items-center justify-center min-w-0">
          <Table {...table} onClick={onTableSelect} />
        </div>
      ))}
    </div>
  );
}
