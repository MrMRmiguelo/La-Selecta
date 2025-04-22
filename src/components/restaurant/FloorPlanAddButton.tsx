
import { Plus } from "lucide-react";

interface FloorPlanAddButtonProps {
  onClick: () => void;
}

export function FloorPlanAddButton({ onClick }: FloorPlanAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute right-8 top-6 z-20 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/80 transition"
      title="Añadir mesa"
      type="button"
    >
      <Plus size={22} />
    </button>
  );
}
