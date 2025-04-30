import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TableFoodItem } from "@/types/restaurant";

interface PaymentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: TableFoodItem[];
  selectedSodas: TableFoodItem[];
  onConfirmPayment: () => void;
}

export function PaymentConfirmationDialog({
  open,
  onOpenChange,
  selectedItems,
  selectedSodas,
  onConfirmPayment
}: PaymentConfirmationDialogProps) {
  const calculateTotal = () => {
    return [...selectedItems, ...selectedSodas].reduce(
      (sum, item) => sum + ((item.price + (item.precioExtra || 0)) * (item.quantity || 1)),
      0
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Pago</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Resumen del Pedido:</h4>
          
          {/* Platos */}
          {selectedItems.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium mb-2">Platos:</h5>
              <ul className="space-y-2">
                {selectedItems.map((item, index) => (
                  <li key={`food-${item.id}-${index}`} className="flex justify-between text-sm">
                    <div>
                      <span>{item.quantity}x {item.name}</span>
                      {item.nota && <span className="text-xs text-gray-500 ml-2">({item.nota})</span>}
                      {item.precioExtra > 0 && <span className="text-xs text-green-600 ml-2">(+L{item.precioExtra.toFixed(2)})</span>}
                    </div>
                    <span>L{((item.price + (item.precioExtra || 0)) * (item.quantity || 1)).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bebidas */}
          {selectedSodas.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium mb-2">Bebidas:</h5>
              <ul className="space-y-2">
                {selectedSodas.map((soda, index) => (
                  <li key={`soda-${soda.id}-${index}`} className="flex justify-between text-sm">
                    <span>{soda.quantity}x {soda.name}</span>
                    <span>L{(soda.price * (soda.quantity || 1)).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Total */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center font-bold">
              <span>Total a Pagar:</span>
              <span>L{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onConfirmPayment}>Confirmar Pago</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}