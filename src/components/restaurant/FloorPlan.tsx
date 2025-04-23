
import { TableProps } from "@/components/restaurant/Table";
import { FloorGrid } from "./FloorGrid";
import { FloorPlanAddButton } from "./FloorPlanAddButton";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface FloorPlanProps {
  tables: TableProps[];
  onTableSelect: (tableId: number) => void;
  onDeleteTable: (tableId: number) => void;
  onOpenAddTable: () => void;
}

export function FloorPlan({ tables, onTableSelect, onDeleteTable, onOpenAddTable }: FloorPlanProps) {
  const isAdmin = useIsAdmin();

  return (
    <div className="bg-gray-100 p-6 rounded-lg relative">
      <h2 className="text-xl font-bold mb-6 text-gray-700">Plano del Restaurante</h2>
      {isAdmin && <FloorPlanAddButton onClick={onOpenAddTable} />}
      <FloorGrid tables={tables} onTableSelect={onTableSelect} />
    </div>
  );
}
