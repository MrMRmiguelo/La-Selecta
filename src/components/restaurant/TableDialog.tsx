import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { PaymentConfirmationDialog } from "@/components/restaurant/PaymentConfirmationDialog";
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
import { Trash, Pencil } from "lucide-react"; // Importar Pencil
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { SodaInventory } from "@/types/soda";
import { supabase } from "@/integrations/supabase/client";

interface TableDialogProps {
  table: TableProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTable: (table: Partial<TableProps>, totalAmount: number, isPayment: boolean) => void;
  onDeleteTable?: (tableId: number) => void;
  menu: MenuItem[];
  updateDailyTotal: (amount: number) => void;
}

// Importamos TableFoodItem desde types/restaurant.ts
// No necesitamos redefinir la interfaz aquí

// Definir un tipo para el elemento que se está editando
type EditingItem = {
  id: number | string; // Puede ser number (plato) o string (soda)
  type: 'food' | 'soda';
  index: number; // Índice en el array correspondiente
};

export function TableDialog({
  table,
  open,
  onOpenChange,
  onUpdateTable,
  onDeleteTable,
  menu,
  updateDailyTotal
}: TableDialogProps) {
  const [status, setStatus] = useState<TableStatus>(table?.status || "free");
  const [customerName, setCustomerName] = useState(table?.customer?.name || "");
  const [partySize, setPartySize] = useState(table?.customer?.partySize || 1);
  const [selectedItems, setSelectedItems] = useState<TableFoodItem[]>(table?.food || []);
  const [sodas, setSodas] = useState<SodaInventory[]>([]);
  const [selectedSodas, setSelectedSodas] = useState<TableFoodItem[]>([]);
  // La inicialización de selectedSodas se maneja completamente en el useEffect
  // para asegurar consistencia con los datos de la mesa
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [dishQuantity, setDishQuantity] = useState<number>(1);
  const [selectedSodaId, setSelectedSodaId] = useState<string | null>(null);
  const [sodaQuantity, setSodaQuantity] = useState<number>(1);
  const [tempNota, setTempNota] = useState<string>("");
  const [tempPrecioExtra, setTempPrecioExtra] = useState<number>(0);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null); // Estado para rastrear la edición
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { toast } = useToast();
  const isAdmin = useIsAdmin();

  // Función para verificar si una bebida está sin stock
  const isSodaOutOfStock = (sodaId: string) => {
    const soda = sodas.find(s => String(s.id) === sodaId);
    return !soda || soda.quantity <= 0;
  };
  // Función para calcular el total
  const calculateTotal = () => {
    return [...selectedItems, ...selectedSodas].reduce(
      (sum, item) => sum + ((item.price + (item.precioExtra || 0)) * (item.quantity || 1)),
      0
    );
  };

  useEffect(() => {
    if (table) {
      setStatus(table.status);
      // Si la mesa está libre, resetear los datos del cliente
      if (table.status === "free") {
        setCustomerName("");
        setPartySize(1);
        setSelectedItems([]); // Limpiar también los items seleccionados
        setSelectedSodas([]); // Limpiar también las sodas seleccionadas
      } else {
        setCustomerName(table.customer?.name || "");
        setPartySize(table.customer?.partySize || 1);
        setSelectedItems(table.food || []);
        
        // Asegurarse de que sodaOrder sea un array y tenga la estructura correcta
        const sodaOrderArray = Array.isArray(table.sodaOrder) ? table.sodaOrder : [];
        
        // Depuración para ver qué contiene sodaOrder
        console.log("sodaOrder original:", table.sodaOrder);
        
        // Mejorar el procesamiento de las bebidas
        const processedSodas = sodaOrderArray
          .filter((soda: any) => soda !== null && typeof soda === 'object')
          .map((soda: any) => {
            // Asegurarse de que todos los campos necesarios estén presentes
            // Priorizar el uso del sodaId original si está disponible
            const sodaIdToUse = soda.sodaId ? String(soda.sodaId).trim() : 
                               (soda.id ? String(soda.id).trim() : null);
                               
            console.log("[DEBUG] Procesando bebida con ID:", {
              original: soda.id,
              sodaId: soda.sodaId,
              usando: sodaIdToUse
            });
            
            return {
              id: soda.id || crypto.randomUUID(), // Generar un ID si no existe
              name: soda.name || "Bebida sin nombre",
              price: typeof soda.price === 'number' ? soda.price : 0,
              quantity: typeof soda.quantity === 'number' ? soda.quantity : 1,
              sodaId: sodaIdToUse, // Usar el ID procesado
              nota: soda.nota || "",
              precioExtra: typeof soda.precioExtra === 'number' ? soda.precioExtra : 0,
              instanceId: soda.instanceId || crypto.randomUUID(), // Asegurar que tenga instanceId
              tipo_cocina: 'buffet' as 'buffet' | 'cocina adentro' | 'cocina afuera' // Valor por defecto para bebidas
            };
          });
          
        // Filtrar bebidas sin ID válido
        const validSodas = processedSodas.filter(soda => soda.sodaId);
        if (validSodas.length < processedSodas.length) {
          console.warn("[DEBUG] Se eliminaron", processedSodas.length - validSodas.length, "bebidas sin ID válido");
        }
        
        console.log("Bebidas procesadas y validadas:", validSodas);
        setSelectedSodas(validSodas); // Usar solo las bebidas con ID válido
      }
    } else {
      // Si no hay tabla seleccionada (p.ej., al cerrar el diálogo), resetear todo
      setStatus("free");
      setCustomerName("");
      setPartySize(1);
      setSelectedItems([]);
      setSelectedSodas([]);
      setSelectedDishId(null);
      setDishQuantity(1);
      setSelectedSodaId(null);
      setSodaQuantity(1);
      setTempNota("");
      setTempPrecioExtra(0);
      setEditingItem(null);
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
    // Si el nuevo estado es 'libre', guardar inmediatamente para liberar la mesa
    if (newStatus === "free") {
      // Llamar a handleSave con isPayment = true para limpiar los datos
      // y actualizar el estado en la base de datos y la UI.
      // Asegurarse de que 'table' no sea null antes de llamar a handleSave.
      if (table) {
        // Crear un objeto temporal con los datos necesarios para limpiar la mesa
        const updateData: Partial<TableProps> = {
          id: table.id,
          customer: undefined,
          food: [],
          sodaOrder: [],
          status: "free" as TableStatus,
          occupiedAt: null
        };
        // Llamar a onUpdateTable directamente para reflejar el cambio
        // El cálculo del total no es relevante aquí ya que se está liberando
        onUpdateTable(updateData, 0, true);
        // Cerrar el diálogo
        onOpenChange(false);
      } else {
        // Manejar el caso donde table es null, si es necesario
        console.error("Error: 'table' es null al intentar liberar la mesa.");
        toast({
          title: "Error",
          description: "No se pudo liberar la mesa porque los datos de la mesa no están disponibles.",
          variant: "destructive"
        });
      }
    }
  };

  const [selectedKitchen, setSelectedKitchen] = useState<'buffet' | 'cocina adentro' | 'cocina afuera'>('buffet');

  const handleAddMenuItem = () => {
    if (!selectedDishId) return;
    const menuItem = menu.find(item => String(item.id) === selectedDishId);
    if (!menuItem) return;

    const newItem: TableFoodItem = {
      ...menuItem,
      instanceId: crypto.randomUUID(), // Generate unique ID for this instance
      quantity: dishQuantity,
      nota: tempNota,
      precioExtra: tempPrecioExtra,
      sodaId: "", // Asegurarse de que sodaId no se herede incorrectamente
      tipo_cocina: selectedKitchen // Agregar el tipo de cocina seleccionado
    };

    setSelectedItems([...selectedItems, newItem]);

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

    // Guardar el ID original de la bebida en el inventario
    const originalSodaId = soda.id;
    console.log("[DEBUG] ID original de la bebida en inventario:", originalSodaId);
    
    // Asegurarse de que la comparación se haga con strings limpios
    const existingSoda = selectedSodas.find(item => String(item.sodaId).trim() === String(originalSodaId).trim());
    console.log("[DEBUG] Comparando sodaId:", String(originalSodaId).trim(), "con las bebidas existentes");
    
    if (existingSoda) {
      setSelectedSodas(selectedSodas.map(item =>
        String(item.sodaId).trim() === String(originalSodaId).trim()
          ? { ...item, quantity: (item.quantity || 0) + sodaQuantity }
          : item
      ));
      console.log("[DEBUG] Actualizando cantidad de bebida existente con sodaId:", String(originalSodaId).trim());
    } else {
      const sodaInstanceId = crypto.randomUUID();
      const newSodaItem: TableFoodItem = {
        id: Number(originalSodaId), // Convertir el ID original a número
        name: soda.name,
        price: soda.price,
        quantity: sodaQuantity,
        sodaId: String(originalSodaId), // Usar el ID original de la bebida en el inventario
        nota: "",
        precioExtra: 0,
        instanceId: sodaInstanceId, // Asignar UUID para la instancia
        tipo_cocina: 'buffet' // Valor por defecto para bebidas
      };
      console.log("[DEBUG] Nueva bebida agregada con sodaId:", String(originalSodaId));
      setSelectedSodas([...selectedSodas, newSodaItem]);
    }
    // Reset selection
    setSelectedSodaId(null);
    setSodaQuantity(1);
    setEditingItem(null); // Resetear edición
  };

  const handleRemoveMenuItem = (instanceIdToRemove: string) => {
    setSelectedItems(selectedItems.filter((item) => item.instanceId !== instanceIdToRemove));
  };

  const handleRemoveSoda = (indexToRemove: number) => {
    setSelectedSodas(selectedSodas.filter((_, index) => index !== indexToRemove));
  };

  // Función para iniciar la edición de un plato
  const handleEditFoodItem = (itemToEdit: TableFoodItem) => {
    // Verificar que itemToEdit tenga la propiedad instanceId
    if (!itemToEdit.instanceId) {
      console.error("Error: El item no tiene instanceId");
      return;
    }
    
    // Encontrar el índice del item a editar usando instanceId
    const itemIndex = selectedItems.findIndex(item => item.instanceId === itemToEdit.instanceId);
    if (itemIndex === -1) return; // No debería pasar, pero por seguridad

    // Eliminar el plato actual de la lista usando su índice
    const updatedItems = selectedItems.filter((_, i) => i !== itemIndex);
    setSelectedItems(updatedItems);
    
    // Establecer los valores para el nuevo plato (que reemplazará al editado)
    setSelectedDishId(String(itemToEdit.id));
    setDishQuantity(itemToEdit.quantity || 1);
    setTempNota(itemToEdit.nota || "");
    setTempPrecioExtra(itemToEdit.precioExtra || 0);
    // Limpiar selección de soda por si acaso
    setSelectedSodaId(null);
    setSodaQuantity(1);
  };

  // Función para iniciar la edición de una bebida
  const handleEditSodaItem = (item: TableFoodItem, index: number) => {
    // Eliminar la bebida actual de la lista
    const updatedSodas = selectedSodas.filter((_, i) => i !== index);
    setSelectedSodas(updatedSodas);
    
    // Verificar que el sodaId sea válido
    if (!item.sodaId) {
      console.error("[DEBUG] Error: La bebida no tiene sodaId válido:", item);
      toast({
        title: "Error al editar bebida",
        description: "La bebida no tiene un ID válido. Por favor, elimínela y agréguela nuevamente.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("[DEBUG] Editando bebida con sodaId:", item.sodaId);
    
    // Establecer los valores para la nueva bebida
    setSelectedSodaId(item.sodaId);
    setSodaQuantity(item.quantity || 1);
    
    // Limpiar selección de plato por si acaso
    setSelectedDishId(null);
    setDishQuantity(1);
    setTempNota("");
    setTempPrecioExtra(0);
    
    console.log("[DEBUG] Datos de bebida para edición:", item);
  };

  // Modificar handleSave para aceptar un indicador de pago
  const handleSave = async (isPayment: boolean = false) => {
    if (!table) return;

    const totalAmount = [...selectedItems, ...selectedSodas].reduce(
      (sum, item) => sum + ((item.price + (item.precioExtra || 0)) * (item.quantity || 1)),
      0
    );

    // Si es un pago, actualizar el estado a libre y limpiar los datos
    const newStatus = isPayment ? "free" : status;
    const newCustomer = isPayment ? undefined : (status === "free" ? undefined : { name: customerName, partySize });
    const newFood = isPayment ? [] : selectedItems;
    
    // Asegurarse de que las bebidas se procesen correctamente
    const newSodaOrder = isPayment ? [] : selectedSodas.map(soda => {
      // Crear un objeto completo con todos los campos necesarios
      return {
        id: soda.id,
        name: soda.name,
        price: soda.price,
        quantity: soda.quantity || 1,
        sodaId: soda.sodaId ? String(soda.sodaId).trim() : "", // Asegurar que el sodaId sea un string limpio
        nota: soda.nota || "",
        precioExtra: soda.precioExtra || 0
      };
    });
    
    console.log("[DEBUG] Procesando sodaOrder para guardar:", newSodaOrder.map(soda => ({ id: soda.id, sodaId: soda.sodaId })));
    
    // Depuración para verificar los datos que se envían a la base de datos
    console.log("Guardando sodaOrder:", newSodaOrder);
    
    const newOccupiedAt = isPayment ? null : (status === "occupied" ? new Date() : undefined);

    // Actualizar en Supabase primero
    const { error: updateError } = await supabase.from("tables").update({
      customer: newCustomer,
      food: newFood,
      soda_order: newSodaOrder,
      status: newStatus,
      occupied_at: newOccupiedAt
    }).eq("id", table.id);

    if (updateError) {
      toast({
        title: "Error al guardar",
        description: updateError.message,
        variant: "destructive"
      });
      return;
    }

    // Si es un pago y no hubo errores, proceder con el proceso de pago
    if (isPayment && totalAmount > 0) {
      try {
        // Preparar los datos para el historial
        const orderHistoryData = {
          table_id: table.id,
          table_number: table.number,
          food: selectedItems,
          extras: selectedItems.filter(item => item.precioExtra && item.precioExtra > 0).map(item => ({
            item_id: item.id,
            item_name: item.name,
            nota: item.nota || "",
            precio_extra: item.precioExtra || 0
          })),
          soda_order: selectedSodas,
          total: totalAmount,
          created_at: new Date()
        };

        // Guardar en la tabla de historial
        const { error: historyError } = await supabase
          .from("table_orders_history")
          .insert(orderHistoryData);

        if (historyError) {
          console.error("Error al guardar historial:", historyError);
          toast({
            title: "Advertencia",
            description: "Se completó el pago pero hubo un error al guardar el historial.",
            variant: "destructive"
          });
        } else {
          console.log("Historial de orden guardado correctamente");
        }

        // Actualizar el inventario de bebidas
        for (const soda of selectedSodas) {
          try {
            console.log("[DEBUG] Procesando bebida:", {
              id: soda.id,
              name: soda.name,
              quantity: soda.quantity,
              sodaId: soda.sodaId
            });

            // Validar que el sodaId sea válido
            if (!soda.sodaId) {
              console.error("[DEBUG] sodaId inválido o faltante:", soda.sodaId);
              throw new Error(`ID inválido o faltante para la bebida ${soda.name}`);
            }
            
            // Asegurar que el sodaId sea un string limpio para todas las operaciones
            const sodaIdString = String(soda.sodaId).trim();

            // Obtener la cantidad actual en inventario usando el sodaId
            console.log("[DEBUG] Consultando bebida con ID:", sodaIdString);
            
            // Intentar primero con el sodaId directamente
            let { data: currentSoda, error: sodaError } = await supabase
              .from("soda_inventory")
              .select("quantity, name")
              .eq("id", sodaIdString)
              .single();
              
            // Si hay error, intentar convertir a número si es posible
            if (sodaError) {
              console.log("[DEBUG] Primer intento fallido, intentando con conversión numérica");
              const numericId = !isNaN(Number(sodaIdString)) ? Number(sodaIdString) : null;
              
              if (numericId !== null) {
                const result = await supabase
                  .from("soda_inventory")
                  .select("quantity, name")
                  .eq("id", numericId)
                  .single();
                  
                currentSoda = result.data;
                sodaError = result.error;
                
                if (!result.error) {
                  console.log("[DEBUG] Consulta exitosa usando ID numérico:", numericId);
                }
              }
            }

            if (sodaError) {
              console.error("[DEBUG] Error al obtener bebida:", sodaError);
              console.error("[DEBUG] Detalles de la bebida que causó el error:", {
                id: soda.id,
                name: soda.name,
                sodaId: soda.sodaId,
                sodaIdString: sodaIdString
              });
              toast({
                title: "Error al procesar bebida",
                description: `No se pudo encontrar la bebida ${soda.name} en el inventario. ID: ${sodaIdString}`,
                variant: "destructive"
              });
              // Continuar con la siguiente bebida en lugar de detener todo el proceso
              continue;
            }

            console.log("[DEBUG] Datos actuales de inventario:", currentSoda);

            if (!currentSoda) {
              console.error("[DEBUG] Bebida no encontrada en inventario:", soda.name);
              console.error("[DEBUG] ID utilizado para la búsqueda:", sodaIdString);
              toast({
                title: "Bebida no encontrada",
                description: `No se encontró la bebida ${soda.name} en el inventario`,
                variant: "destructive"
              });
              // Continuar con la siguiente bebida en lugar de detener todo el proceso
              continue;
            }

            // Calcular nueva cantidad
            const newQuantity = (currentSoda.quantity || 0) - (soda.quantity || 0);
            console.log("[DEBUG] Cálculo de nueva cantidad:", {
              bebida: currentSoda.name,
              cantidadActual: currentSoda.quantity,
              cantidadOrdenada: soda.quantity,
              nuevaCantidad: newQuantity
            });

            // Validar que no quede en negativo
            if (newQuantity < 0) {
              console.error("[DEBUG] Cantidad insuficiente:", {
                bebida: currentSoda.name,
                disponible: currentSoda.quantity,
                solicitado: soda.quantity
              });
              throw new Error(`No hay suficiente inventario de ${currentSoda.name}. Disponible: ${currentSoda.quantity}`);
            }

            // Actualizar inventario
            console.log("[DEBUG] Actualizando inventario para bebida ID:", sodaIdString);
            const { error: updateError } = await supabase
              .from("soda_inventory")
              .update({ quantity: newQuantity })
              .eq("id", sodaIdString);

            if (updateError) {
              console.error("[DEBUG] Error al actualizar inventario:", updateError);
              console.error("[DEBUG] Detalles de la bebida que causó el error de actualización:", {
                bebida: currentSoda.name,
                id: sodaIdString,
                cantidadActual: currentSoda.quantity,
                cantidadNueva: newQuantity
              });
              toast({
                title: "Error al actualizar inventario",
                description: `No se pudo actualizar el inventario para ${currentSoda.name}. El pago se procesó correctamente.`,
                variant: "destructive"
              });
              // Continuar con la siguiente bebida en lugar de detener todo el proceso
              continue;
            }

            console.log("[DEBUG] Inventario actualizado exitosamente:", {
              bebida: currentSoda.name,
              nuevaCantidad: newQuantity
            });
          } catch (error) {
            console.error("[DEBUG] Error detallado al actualizar inventario:", error);
            console.error("[DEBUG] Bebida que causó el error:", {
              id: soda.id,
              name: soda.name,
              sodaId: soda.sodaId
            });
            toast({
              title: "Error en inventario",
              description: error instanceof Error ? error.message : "Hubo un problema al actualizar el inventario de bebidas.",
              variant: "destructive"
            });
            // No propagar el error, continuar con las demás bebidas
            continue;
          }
        }

        updateDailyTotal(totalAmount); // Llamar a la prop para actualizar el total
      } catch (error) {
        console.error("Error durante el proceso de pago:", error);
        toast({
          title: "Error en el proceso de pago",
          description: "Hubo un problema durante el proceso de pago. Por favor, inténtelo de nuevo.",
          variant: "destructive"
        });
        return;
      }

      // Limpiar estado local solo si todo el proceso fue exitoso
      setStatus("free");
      setCustomerName("");
      setPartySize(1);
      setSelectedItems([]);
      setSelectedSodas([]);
    } else if (status === "occupied" && selectedItems.length > 0) {
      // Crear una nueva orden en la tabla de órdenes para la cocina
      try {
        const orderData = {
          table_number: table.number,
          items: selectedItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            notes: item.nota
          })),
          status: "pending",
          created_at: new Date().toISOString()
        };

        const { error: orderError } = await supabase
          .from("orders")
          .insert(orderData);

        if (orderError) {
          console.error("Error al crear orden en cocina:", orderError);
          toast({
            title: "Advertencia",
            description: "Se guardó la orden pero hubo un error al enviarla a cocina.",
            variant: "destructive"
          });
        }
      } catch (orderErr) {
        console.error("Error al procesar orden de cocina:", orderErr);
      }
    }

    // Actualizar el estado de la mesa en la interfaz
    await onUpdateTable({
      id: table.id,
      customer: newCustomer,
      food: newFood,
      sodaOrder: newSodaOrder,
      status: newStatus,
      occupiedAt: newOccupiedAt
    }, totalAmount, isPayment);

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
                  className="col-span-3" />
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
                  className="col-span-3" />
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
                    className="w-20" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 mt-2">
                  <Label className="text-right">Complementos</Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      placeholder="Complementos"
                      value={tempNota}
                      onChange={(e) => setTempNota(e.target.value)}
                      className="flex-1"
                      disabled={!selectedDishId} />
                    <Input
                      type="number"
                      placeholder="Precio extra"
                      value={tempPrecioExtra}
                      onChange={(e) => setTempPrecioExtra(parseFloat(e.target.value) || 0)}
                      className="w-32"
                      disabled={!selectedDishId} />
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button onClick={handleAddMenuItem} size="sm" disabled={!selectedDishId}>
                    Añadir Plato
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-4 font-semibold">Bebidas</h4>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sodaItem" className="text-right">
                    Bebida
                  </Label>
                  <Select value={selectedSodaId || ""} onValueChange={setSelectedSodaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar bebida" />
                    </SelectTrigger>
                    <SelectContent>
                      {sodas.map((soda) => (
                        <SelectItem
                          key={soda.id}
                          value={String(soda.id)}
                          disabled={isSodaOutOfStock(String(soda.id))}
                        >
                          {soda.name} {isSodaOutOfStock(String(soda.id)) && "(Fuera de stock)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end mt-2">
                  <Button onClick={handleAddSoda} size="sm" disabled={!selectedSodaId}>Añadir Bebida</Button>
                </div>
              </div>
            </>
          )}

          </div>       
        {/* Sección Pedido Actual */}
        {(status !== "free") && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Pedido Actual:</h4>
            {selectedItems.length === 0 && selectedSodas.length === 0 ? (
              <p className="text-sm text-gray-500">No hay elementos en el pedido.</p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {selectedItems.map((item, index) => (
                  <li key={`food-${item.id}-${index}`} className="flex justify-between items-center text-sm border-b pb-1">
                    <div>
                      <span>{item.quantity}x {item.name}</span>
                      {item.nota && <span className="text-xs text-gray-500 ml-2">({item.nota})</span>}
                      {item.precioExtra > 0 && <span className="text-xs text-green-600 ml-2"> (+L {item.precioExtra.toFixed(2)})</span>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>L {((item.price + (item.precioExtra || 0)) * (item.quantity || 1)).toFixed(2)}</span>

                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveMenuItem(item.instanceId)}>
                        <Trash size={14} />
                      </Button>
                    </div>
                  </li>
                ))}
                {selectedSodas.map((soda, index) => (
                  <li key={`soda-${soda.id}-${index}`} className="flex justify-between items-center text-sm border-b pb-1">
                    <div>
                      <span>{soda.quantity}x {soda.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>L {(soda.price * (soda.quantity || 1)).toFixed(2)}</span>
                     
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveSoda(index)}>
                        <Trash size={14} />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 font-bold text-right">
              Total: L {calculateTotal().toFixed(2)}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                {isAdmin && table && (
                  <Button variant="destructive" onClick={handleDelete}>
                    Eliminar Mesa
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                {status === "occupied" && (
                  <Button onClick={() => setShowPaymentDialog(true)}>Cobrar y Liberar</Button>
                )}
                {newFunction()}
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Diálogo de Confirmación de Pago */}
      <PaymentConfirmationDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        selectedItems={selectedItems}
        selectedSodas={selectedSodas}
        onConfirmPayment={() => {
          handleSave(true);
          setShowPaymentDialog(false);
        }}
      />
    </Dialog>
  );

  function newFunction() {
    return <Button onClick={() => handleSave(false)} disabled={status === "free" || (!customerName || partySize <= 0)}>Guardar</Button>;
  }
}
