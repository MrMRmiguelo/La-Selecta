import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RestaurantLayout } from "@/components/layout/RestaurantLayout";
import { MenuItem } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, ShoppingCart, Receipt, Trash2, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { printInvoice, downloadInvoice } from "@/utils/printInvoice";

interface BillItem extends MenuItem {
  quantity: number;
  subtotal: number;
}

interface Soda {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface BillSoda extends Soda {
  quantity: number;
  subtotal: number;
}

const QuickBilling = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [sodas, setSodas] = useState<Soda[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [billSodas, setBillSodas] = useState<BillSoda[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMenu();
    fetchSodas();
  }, []);

  const fetchMenu = async () => {
    const { data, error } = await supabase.from("menu").select("*").order("name");
    if (!error && data) {
      setMenu(data);
    }
  };

  const fetchSodas = async () => {
    const { data, error } = await supabase.from("soda_inventory").select("*").order("name");
    if (!error && data) {
      setSodas(data);
    }
  };

  const addItemToBill = (item: MenuItem) => {
    setBillItems(prev => {
      const existingItem = prev.find(billItem => billItem.id === item.id);
      if (existingItem) {
        return prev.map(billItem => 
          billItem.id === item.id 
            ? { ...billItem, quantity: billItem.quantity + 1, subtotal: (billItem.quantity + 1) * billItem.price }
            : billItem
        );
      } else {
        return [...prev, { ...item, quantity: 1, subtotal: item.price }];
      }
    });
  };

  const addSodaToBill = (soda: Soda) => {
    if (soda.stock <= 0) {
      toast({
        title: "Sin stock",
        description: `No hay stock disponible de ${soda.name}`,
        variant: "destructive"
      });
      return;
    }

    setBillSodas(prev => {
      const existingSoda = prev.find(billSoda => billSoda.id === soda.id);
      if (existingSoda) {
        if (existingSoda.quantity >= soda.stock) {
          toast({
            title: "Stock insuficiente",
            description: `Solo hay ${soda.stock} unidades disponibles de ${soda.name}`,
            variant: "destructive"
          });
          return prev;
        }
        return prev.map(billSoda => 
          billSoda.id === soda.id 
            ? { ...billSoda, quantity: billSoda.quantity + 1, subtotal: (billSoda.quantity + 1) * billSoda.price }
            : billSoda
        );
      } else {
        return [...prev, { ...soda, quantity: 1, subtotal: soda.price }];
      }
    });
  };

  const removeItemFromBill = (itemId: number) => {
    setBillItems(prev => {
      const existingItem = prev.find(billItem => billItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(billItem => 
          billItem.id === itemId 
            ? { ...billItem, quantity: billItem.quantity - 1, subtotal: (billItem.quantity - 1) * billItem.price }
            : billItem
        );
      } else {
        return prev.filter(billItem => billItem.id !== itemId);
      }
    });
  };

  const removeSodaFromBill = (sodaId: string) => {
    setBillSodas(prev => {
      const existingSoda = prev.find(billSoda => billSoda.id === sodaId);
      if (existingSoda && existingSoda.quantity > 1) {
        return prev.map(billSoda => 
          billSoda.id === sodaId 
            ? { ...billSoda, quantity: billSoda.quantity - 1, subtotal: (billSoda.quantity - 1) * billSoda.price }
            : billSoda
        );
      } else {
        return prev.filter(billSoda => billSoda.id !== sodaId);
      }
    });
  };

  const clearBill = () => {
    setBillItems([]);
    setBillSodas([]);
    setCustomerName("");
  };

  const getTotalAmount = () => {
    const itemsTotal = billItems.reduce((sum, item) => sum + item.subtotal, 0);
    const sodasTotal = billSodas.reduce((sum, soda) => sum + soda.subtotal, 0);
    return itemsTotal + sodasTotal;
  };

  const processBill = async () => {
    if (billItems.length === 0 && billSodas.length === 0) {
      toast({
        title: "Factura vacía",
        description: "Agrega al menos un plato o bebida para procesar la factura.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const totalAmount = getTotalAmount();
      
      // Agregar a la contabilidad diaria
      const { error: dailyError } = await supabase.from("daily_sales").insert({
        sale_date: new Date().toISOString().split('T')[0],
        table_id: null, // Para facturación rápida no hay mesa específica
        food_items: billItems.map(item => ({ itemId: item.id, quantity: item.quantity, name: item.name, price: item.price })),
        soda_items: billSodas.map(soda => ({ sodaId: soda.id, quantity: soda.quantity, name: soda.name, price: soda.price })),
        total: totalAmount
      });

      if (dailyError) {
        // Si la tabla no existe, mostrar mensaje específico
        if (dailyError.message?.includes('relation "daily_sales" does not exist')) {
          console.warn('Tabla daily_sales no existe. La venta se procesó pero no se guardó en contabilidad diaria.');
          toast({
            title: "Venta procesada",
            description: "La venta se completó exitosamente. Nota: La tabla de contabilidad diaria necesita ser configurada.",
            variant: "default",
          });
        } else {
          throw dailyError;
        }
      }

      // Actualizar stock de bebidas
      for (const billSoda of billSodas) {
        const { error: stockError } = await supabase
          .from("soda_inventory")
          .update({ stock: billSoda.stock - billSoda.quantity })
          .eq("id", billSoda.id);
        
        if (stockError) {
          throw stockError;
        }
      }

      // Actualizar el estado local de sodas
      setSodas(prev => prev.map(soda => {
        const billSoda = billSodas.find(bs => bs.id === soda.id);
        return billSoda ? { ...soda, stock: soda.stock - billSoda.quantity } : soda;
      }));

      toast({
        title: "Factura procesada",
        description: `Factura por L ${totalAmount.toFixed(2)} procesada exitosamente.`
      });

      // Generar e imprimir factura
      const invoiceData = {
        customerName: customerName || undefined,
        tableNumber: undefined, // No hay mesa en facturación rápida
        items: billItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })),
        sodas: billSodas.map(soda => ({
          name: soda.name,
          quantity: soda.quantity,
          price: soda.price,
          subtotal: soda.subtotal
        })),
        total: totalAmount,
        date: new Date(),
        invoiceType: 'rapida' as const
      };

      // Imprimir factura automáticamente
      printInvoice(invoiceData);

      clearBill();
      setPaymentDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error al procesar factura",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const groupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.tipo_cocina]) {
      acc[item.tipo_cocina] = [];
    }
    acc[item.tipo_cocina].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <RestaurantLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Facturación Rápida</h1>
            <p className="text-gray-600 mt-2">Selecciona platos y bebidas para crear una factura</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearBill} disabled={billItems.length === 0 && billSodas.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={billItems.length === 0 && billSodas.length === 0}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Procesar Factura (L {getTotalAmount().toFixed(2)})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Procesar Factura</DialogTitle>
                  <DialogDescription>
                    Revisa los detalles de la factura antes de procesarla.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer-name">Nombre del Cliente (Opcional)</Label>
                    <Input
                      id="customer-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Resumen de la Factura:</h4>
                    {billItems.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>L {item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                    {billSodas.map(soda => (
                      <div key={soda.id} className="flex justify-between text-sm">
                        <span>{soda.name} x{soda.quantity}</span>
                        <span>L {soda.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>L {getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancelar</Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const invoiceData = {
                          customerName: customerName || undefined,
                          tableNumber: undefined,
                          items: billItems.map(item => ({
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            subtotal: item.subtotal
                          })),
                          sodas: billSodas.map(soda => ({
                            name: soda.name,
                            quantity: soda.quantity,
                            price: soda.price,
                            subtotal: soda.subtotal
                          })),
                          total: getTotalAmount(),
                          date: new Date(),
                          invoiceType: 'rapida' as const
                        };
                        printInvoice(invoiceData);
                      }}
                      disabled={billItems.length === 0 && billSodas.length === 0}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Vista Previa
                    </Button>
                    <Button onClick={processBill} disabled={isProcessing}>
                      {isProcessing ? "Procesando..." : "Confirmar Pago"}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menú de Platos */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Platos Disponibles</h2>
              <div className="space-y-4">
                {Object.entries(groupedMenu).map(([kitchen, items]) => (
                  <Card key={kitchen}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg capitalize">{kitchen}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {items.map((item) => (
                          <Button
                            key={item.id}
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-start text-left"
                            onClick={() => addItemToBill(item)}
                          >
                            <div className="flex justify-between w-full items-center">
                              <span className="font-medium">{item.name}</span>
                              <Plus className="h-4 w-4" />
                            </div>
                            <span className="text-sm text-gray-600">L {item.price.toFixed(2)}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Bebidas */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Bebidas Disponibles</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sodas.map((soda) => (
                      <Button
                        key={soda.id}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-start text-left"
                        onClick={() => addSodaToBill(soda)}
                        disabled={soda.stock <= 0}
                      >
                        <div className="flex justify-between w-full items-center">
                          <span className="font-medium">{soda.name}</span>
                          <Plus className="h-4 w-4" />
                        </div>
                        <div className="flex justify-between w-full">
                          <span className="text-sm text-gray-600">L {soda.price.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">Stock: {soda.stock}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Factura Actual */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Factura Actual
                </CardTitle>
                <CardDescription>
                  {billItems.length + billSodas.length} artículo{billItems.length + billSodas.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {billItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-600">L {item.price.toFixed(2)} c/u</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItemFromBill(item.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addItemToBill(item)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-sm font-medium ml-2 w-16 text-right">
                        L {item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  
                  {billSodas.map((soda) => (
                    <div key={soda.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{soda.name}</div>
                        <div className="text-xs text-gray-600">L {soda.price.toFixed(2)} c/u</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSodaFromBill(soda.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{soda.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSodaToBill(soda)}
                          disabled={soda.quantity >= soda.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-sm font-medium ml-2 w-16 text-right">
                        L {soda.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  
                  {billItems.length === 0 && billSodas.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No hay artículos en la factura</p>
                      <p className="text-sm">Haz clic en los platos o bebidas para agregarlos</p>
                    </div>
                  )}
                  
                  {(billItems.length > 0 || billSodas.length > 0) && (
                    <>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>L {getTotalAmount().toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RestaurantLayout>
  );
};

export default QuickBilling;