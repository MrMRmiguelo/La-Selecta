
import { useState, useEffect } from "react";
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
import { TableCustomer, MenuItem, TableFoodItem } from "@/types/restaurant";

// Nueva importación para el ícono de basura:
import { Trash } from "lucide-react";

interface TableDialogProps {
  table: TableProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTable: (tableUpdate: Partial<TableProps>, totalToAccount?: number) => void;
  onDeleteTable: (tableId: number) => void; // <---- NUEVA PROP
  menu: MenuItem[]; // <--- nuevo prop
}

export function TableDialog({ 
  table, 
  open, 
  onOpenChange,
  onUpdateTable,
  onDeleteTable, // <--- recibida aquí
  menu = []
}: TableDialogProps) {
  const [status, setStatus] = useState<TableStatus>(table?.status || "free");
  const [customerName, setCustomerName] = useState(table?.customer?.name || "");
  const [partySize, setPartySize] = useState(table?.customer?.partySize || 1);
  const [food, setFood] = useState<TableFoodItem[]>(table?.food || []);

  // Añadir plato temporalmente (en el formulario de la mesa)
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");
  const [selectedQty, setSelectedQty] = useState<string>("1");

  // Reset form when table changes
  useEffect(() => {
    if (table) {
      setStatus(table.status);
      setCustomerName(table.customer?.name || "");
      setPartySize(table.customer?.partySize || 1);
      setFood(table.food || []);
    }
  }, [table]);

  if (!table) return null;

  // Calcular total
  const getFoodTotal = () => {
    return food.reduce((sum, fitem) => {
      const menuObj = menu.find(m => m.id === fitem.itemId);
      return menuObj ? sum + menuObj.price * fitem.quantity : sum;
    }, 0);
  };

  const handleSubmit = () => {
    let totalVendido = 0;
    const update: Partial<TableProps> = {
      id: table?.id,
      status,
      food,
    };

    if (status === "occupied" || status === "reserved") {
      const customer: TableCustomer = {
        name: customerName,
        partySize,
      };
      update.customer = customer;
      
      if (status === "occupied") {
        update.occupiedAt = new Date();
      } else {
        update.occupiedAt = undefined;
      }
    } else {
      // Si pasa de ocupada/reservada a libre, hacer contabilidad
      if ((table.status === "occupied" || table.status === "reserved") && table.food && table.food.length > 0) {
        totalVendido = getFoodTotal();
      }
      update.customer = undefined;
      update.occupiedAt = undefined;
      update.food = [];
    }

    onUpdateTable(update, totalVendido);
    onOpenChange(false);
  };

  // Nueva función para eliminar mesa
  const handleDeleteTable = () => {
    if (table && table.id) {
      onDeleteTable(table.id);
      onOpenChange(false);
    }
  };

  // Añadir un plato a la mesa
  const handleAddFood = () => {
    const itemId = Number(selectedMenuItem);
    const quantity = Number(selectedQty);
    if (!itemId || !quantity) return;
    // Si ya hay ese plato, suma cantidades
    const existing = food.find(f => f.itemId === itemId);
    if (existing) {
      setFood(
        food.map(f => 
          f.itemId === itemId ? { ...f, quantity: f.quantity + quantity } : f
        )
      );
    } else {
      setFood([...food, { itemId, quantity }]);
    }
    setSelectedMenuItem("");
    setSelectedQty("1");
  };

  // Eliminar alimento de la lista consumida
  const handleRemoveFood = (itemId: number) => {
    setFood(food.filter(f => f.itemId !== itemId));
  };

  // ----------- UI ----------
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

              {/* Gestión de alimentación */}
              <div>
                <Label>Alimentos Consumidos</Label>
                <ul className="mb-2">
                  {food.length === 0 && <li className="text-sm text-gray-400">Ninguno</li>}
                  {food.map(fitem => {
                    const menuObj = menu.find(m => m.id === fitem.itemId);
                    return menuObj ? (
                      <li key={fitem.itemId} className="flex items-center gap-2 text-sm mb-1">
                        <span className="font-medium">{menuObj.name}</span>
                        <span>x{fitem.quantity}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveFood(fitem.itemId)}>Quitar</Button>
                        <span className="text-xs text-gray-500 ml-2">
                          L {menuObj.price.toFixed(2)} c/u
                        </span>
                      </li>
                    ) : null;
                  })}
                </ul>
                <div className="flex gap-2">
                  <Select
                    value={selectedMenuItem}
                    onValueChange={v => setSelectedMenuItem(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Plato" />
                    </SelectTrigger>
                    <SelectContent>
                      {menu.map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    value={selectedQty}
                    className="w-[60px]"
                    onChange={e => setSelectedQty(e.target.value)}
                  />
                  <Button variant="secondary" onClick={handleAddFood}>Añadir</Button>
                </div>
                <div className="text-right mt-2 font-semibold">
                  Total: L {getFoodTotal().toFixed(2)}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-row items-center justify-between gap-2">
          <Button 
            variant="destructive" 
            onClick={handleDeleteTable}
            className="flex items-center gap-2"
            type="button"
          >
            <Trash size={18} />
            Eliminar mesa
          </Button>
          <Button onClick={handleSubmit}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// El archivo está siendo muy extenso (~248 líneas). Te recomiendo pedir refactorización para facilitar su mantenimiento.

