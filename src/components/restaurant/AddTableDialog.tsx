
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface AddTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (number: number, capacity: number, shape: "round" | "square" | "rect") => void;
}

export function AddTableDialog({ open, onOpenChange, onAdd }: AddTableDialogProps) {
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [shape, setShape] = useState<"round" | "square" | "rect">("round");

  const handleSubmit = () => {
    if (!number || !capacity || Number(number) <= 0 || Number(capacity) <= 0) return;
    onAdd(Number(number), Number(capacity), shape);
    setNumber("");
    setCapacity("");
    setShape("round");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Añadir mesa</DialogTitle>
        <DialogDescription>
          Indica el número, la capacidad y la forma de la mesa.
        </DialogDescription>
        <div className="flex flex-col gap-3 mt-2">
          <Input
            placeholder="Número"
            value={number}
            onChange={e => setNumber(e.target.value.replace(/\D/, ""))}
            type="number"
            min={1}
          />
          <Input
            placeholder="Capacidad"
            value={capacity}
            onChange={e => setCapacity(e.target.value.replace(/\D/, ""))}
            type="number"
            min={1}
          />
          <Select
            value={shape}
            onValueChange={v => setShape(v as "round" | "square" | "rect")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Forma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round">Redonda</SelectItem>
              <SelectItem value="square">Cuadrada</SelectItem>
              <SelectItem value="rect">Rectangular</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Añadir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
