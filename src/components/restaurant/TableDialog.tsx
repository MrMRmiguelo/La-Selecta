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
import { Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { SodaInventory } from "@/types/soda";
import { supabase } from "@/integrations/supabase/client";

interface TableDialogProps {
  table: TableProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTable: (table: Partial<TableProps>, totalAmount: number) => void;
  onDeleteTable?: (tableId: number) => void;
  menu: MenuItem[];
}

export function TableDialog({
  table,
  open,
  onOpenChange,
  onUpdateTable,
  onDeleteTable,
  menu
}: TableDialogProps) {
  const [status, setStatus] = useState<TableStatus>(table?.status || "free");
  const [customerName, setCustomerName] = useState(table?.customer?.name || "");
  const [partySize, setPartySize] = useState(table?.customer?.partySize || 1);
  const [selectedItems, setSelectedItems] = useState<TableFoodItem[]>(table?.food || []);
  const [sodas, setSodas] = useState<SodaInventory[]>([]);
  const [selectedSodas, setSelectedSodas] = useState<TableFoodItem[]>(table?.sodaOrder?.map((soda: any) => ({
    id: soda.id,
    name: soda.name,
    price: soda.price,
    quantity: soda.quantity || 1,
    sodaId: soda.id.toString(),
    nota: "",
    precioExtra: 0
  })) || []);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [dishQuantity, setDishQuantity] = useState<number>(1);
  const [selectedSodaId, setSelectedSodaId] = useState<string | null>(null);
  const [sodaQuantity, setSodaQuantity] = useState<number>(1);
  const [tempNota, setTempNota] = useState<string>("");
  const [tempPrecioExtra, setTempPrecioExtra] = useState<number>(0);
  const { toast } = useToast();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    if (table) {
      setStatus(table.status);
      setCustomerName(table.customer?.name || "");
      setPartySize(table.customer?.partySize || 1);
      setSelectedItems(table.food || []);
      setSelectedSodas(
        table.sodaOrder
          ?.filter((soda: any) => soda && soda.id != null) // Filtrar sodas nulas o sin id
          .map((soda: any) => ({
            id: soda.id,
            name: soda.name,
            price: soda.price,
            quantity: soda.quantity || 1,
            sodaId: soda.id.toString(), // Ahora es seguro llamar a toString
            nota: "",
            precioExtra: 0
          })) || []
      );
    }
  }, [table]);

  useEffect(() => {
    const fetchSodas = async () => {
      const { data } = await supabase
        .from("soda_inventory")
        .select("*")
        .order("name");
      if (data) setSodas(data);
    };
    fetchSodas();
  }, []);

  const handleStatusChange = (newStatus: TableStatus) => {
    setStatus(newStatus);
  };

  const handleAddMenuItem = () => {
    if (!selectedDishId) return;
    const menuItem = menu.find(item => String(item.id) === selectedDishId);
    if (!menuItem) return;

    const existingItem = selectedItems.find(item => String(item.id) === selectedDishId);
    if (existingItem) {
      setSelectedItems(selectedItems.map(item =>
        String(item.id) === selectedDishId
          ? { 
              ...item, 
              quantity: (item.quantity || 0) + dishQuantity,
              nota: tempNota,
              precioExtra: tempPrecioExtra
            }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, {
        ...menuItem,
        quantity: dishQuantity,
        nota: tempNota,
        precioExtra: tempPrecioExtra,
        sodaId: ""
      }]);
    }
    // Reset selection
    setSelectedDishId(null);
    setDishQuantity(1);
    setTempNota("");
    setTempPrecioExtra(0);
  };

  const handleAddSoda = () => {
    if (!selectedSodaId) return;
    const soda = sodas.find(s => String(s.id) === selectedSodaId);
    if (!soda) return;

    const existingSoda = selectedSodas.find(item => String(item.id) === selectedSodaId);
    if (existingSoda) {
      setSelectedSodas(selectedSodas.map(item =>
        String(item.id) === selectedSodaId
          ? { ...item, quantity: (item.quantity || 0) + sodaQuantity }
          : item
      ));
    } else {
      const newSodaItem: TableFoodItem = {
        id: Number(soda.id),
        name: soda.name,
        price: soda.price,
        quantity: sodaQuantity,
        sodaId: soda.id.toString(),
        nota: "",
        precioExtra: 0
      };
      setSelectedSodas([...selectedSodas, newSodaItem]);
    }
    // Reset selection
    setSelectedSodaId(null);
    setSodaQuantity(1);
  };

  const handleRemoveMenuItem = (itemId: number) => {
    setSelectedItems(selectedItems.filter(item => String(item.id) !== String(itemId)));
  };

  const handleRemoveSoda = (sodaId: string) => {
    setSelectedSodas(selectedSodas.filter(soda => String(soda.id) !== String(sodaId)));
  };

  const handleSave = async () => {
    if (!table) return;

    const totalAmount = [...selectedItems, ...selectedSodas].reduce(
      (sum, item) => sum + ((item.price + (item.precioExtra || 0)) * (item.quantity || 1)),
      0
    );

    await onUpdateTable({
      id: table.id,
      customer: status !== "free" ? { name: customerName, partySize } : undefined,
      food: selectedItems,
      sodaOrder: selectedSodas,
      status: status, // Asegurar que el estado se guarde según la selección del usuario
      occupiedAt: status === "occupied" ? new Date() : undefined
    }, totalAmount);

    // Verificar si hay errores en la respuesta del servidor
    const { error } = await supabase.from("tables").update({
      customer: status !== "free" ? { name: customerName, partySize } : undefined,
      food: selectedItems,
      soda_order: selectedSodas, // Cambiado de 'sodas' a 'soda_order'
      status: status, // Asegurar que el estado se guarde según la selección del usuario
      occupied_at: status === "occupied" ? new Date() : undefined
    }).eq("id", table.id);

    if (error) {
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (table && onDeleteTable) {
      onDeleteTable(table.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mesa {table?.number}</DialogTitle>
          <DialogDescription>
            Capacidad: {table?.capacity} personas
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Estado
            </Label>
            <Select
              value={status}
              onValueChange={(value: TableStatus) => handleStatusChange(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Libre</SelectItem>
                <SelectItem value="occupied">Ocupada</SelectItem>
                <SelectItem value="reserved">Reservada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status !== "free" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer" className="text-right">
                  Cliente
                </Label>
                <Input
                  id="customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="partySize" className="text-right">
                  Personas
                </Label>
                <Input
                  id="partySize"
                  type="number"
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value))}
                  min={1}
                  max={table?.capacity || 1}
                  className="col-span-3"
                />
              </div>
            </>
          )}

          {status === "occupied" && (
            <>
              <div className="border-t pt-4">
                <h4 className="mb-4 font-semibold">Menú</h4>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="menuItem" className="text-right">
                    Plato
                  </Label>
                  <Select value={selectedDishId || ""} onValueChange={(value) => setSelectedDishId(value)}>
                    <SelectTrigger className="col-span-2">
                      <SelectValue placeholder="Selecciona un plato" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {menu.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} - L {item.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    value={dishQuantity}
                    onChange={(e) => setDishQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 mt-2">
                  <Label className="text-right">Complementos</Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      placeholder="Complementos"
                      value={tempNota}
                      onChange={(e) => setTempNota(e.target.value)}
                      className="flex-1"
                      disabled={!selectedDishId}
                    />
                    <Input
                      type="number"
                      placeholder="Precio extra"
                      value={tempPrecioExtra}
                      onChange={(e) => setTempPrecioExtra(parseFloat(e.target.value) || 0)}
                      className="w-32"
                      disabled={!selectedDishId}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button onClick={handleAddMenuItem} size="sm" disabled={!selectedDishId}>Añadir</Button>
                </div>
                </div>
              

              <div className="border-t pt-4">
                <h4 className="mb-4 font-semibold">Bebidas</h4>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sodaItem" className="text-right">
                    Bebida
                  </Label>
                  <Select value={selectedSodaId || ""} onValueChange={(value) => setSelectedSodaId(value)}>
                    <SelectTrigger className="col-span-2">
                      <SelectValue placeholder="Selecciona una bebida" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {sodas.map((soda) => (
                        <SelectItem 
                          key={soda.id} 
                          value={soda.id.toString()}
                          disabled={soda.quantity <= 0}
                        >
                          {soda.name} - L {soda.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    value={sodaQuantity}
                    onChange={(e) => setSodaQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button onClick={handleAddSoda} size="sm" disabled={!selectedSodaId}>Añadir</Button>
                </div>
              </div>

              {(selectedItems.length > 0 || selectedSodas.length > 0) && (
                <div className="border-t pt-4">
                  <h4 className="mb-4 font-semibold">Pedido Actual</h4>
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between mb-2">
                      <span>
                        {item.name} x{item.quantity} {item.nota && `(${item.nota})`} - L {(item.price + (item.precioExtra || 0)) * (item.quantity || 1)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMenuItem(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {selectedSodas.map((soda) => (
                    <div key={soda.id} className="flex items-center justify-between mb-2">
                      <span>
                        {soda.name} x{soda.quantity} - L {soda.price * (soda.quantity || 1)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSoda(soda.id.toString())}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="mt-4 text-right font-semibold">
                    Total: L {[...selectedItems, ...selectedSodas].reduce(
                      (sum, item) => sum + ((item.price + (item.precioExtra || 0)) * (item.quantity || 1)),
                      0
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {isAdmin && onDeleteTable && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="mr-auto"
            >
              Eliminar Mesa
            </Button>
          )}
          {(status === "occupied" || status === "reserved") && (
            <Button
              type="button"
              variant="default"
              onClick={async () => {
                setStatus("free");
                await handleSave();
              }}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Realizar Pago
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
