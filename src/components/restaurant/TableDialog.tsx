
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { TableStatus, TableProps } from "@/components/restaurant/Table";
import { TableCustomer } from "@/types/restaurant";

interface TableDialogProps {
  table: TableProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTable: (tableUpdate: Partial<TableProps>) => void;
}

export function TableDialog({ 
  table, 
  open, 
  onOpenChange,
  onUpdateTable
}: TableDialogProps) {
  const [status, setStatus] = useState<TableStatus>(table?.status || "free");
  const [customerName, setCustomerName] = useState(table?.customer?.name || "");
  const [partySize, setPartySize] = useState(table?.customer?.partySize || 1);

  // Reset form when table changes
  if (table && table.id && table.id !== table?.id) {
    setStatus(table.status);
    setCustomerName(table.customer?.name || "");
    setPartySize(table.customer?.partySize || 1);
  }

  const handleSubmit = () => {
    const update: Partial<TableProps> = {
      id: table?.id,
      status,
    };

    if (status === "occupied" || status === "reserved") {
      const customer: TableCustomer = {
        name: customerName,
        partySize,
      };
      update.customer = customer;
      
      if (status === "occupied") {
        update.occupiedAt = new Date();
      }
    } else {
      update.customer = undefined;
      update.occupiedAt = undefined;
    }

    onUpdateTable(update);
    onOpenChange(false);
  };

  if (!table) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mesa {table.number}</DialogTitle>
          <DialogDescription>
            Capacidad: {table.capacity} personas
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Estado</Label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as TableStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Libre</SelectItem>
                <SelectItem value="occupied">Ocupada</SelectItem>
                <SelectItem value="reserved">Reservada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(status === "occupied" || status === "reserved") && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="customerName">Nombre del Cliente</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="partySize">Número de Personas</Label>
                <Select 
                  value={partySize.toString()} 
                  onValueChange={(value) => setPartySize(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cantidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: table.capacity }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
