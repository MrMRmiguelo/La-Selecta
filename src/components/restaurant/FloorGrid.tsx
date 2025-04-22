
import { Table, TableProps } from "@/components/restaurant/Table";

interface FloorGridProps {
  tables: TableProps[];
  onTableSelect: (tableId: number) => void;
}

export function FloorGrid({ tables, onTableSelect }: FloorGridProps) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 relative min-h-[400px]">
      {tables.map((table) => (
        <div key={table.id} className="relative flex items-center justify-center">
          <Table {...table} onClick={onTableSelect} />
        </div>
      ))}
    </div>
  );
}
