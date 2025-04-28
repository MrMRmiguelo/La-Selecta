import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { SodaInventory, SodaInventoryInsert, SodaInventoryUpdate } from "@/types/soda";

export function SodaInventoryManager() {
  const isAdmin = useIsAdmin();
  const [sodas, setSodas] = useState<SodaInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Nuevo estado para el error
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSoda, setCurrentSoda] = useState<SodaInventory | null>(null);
  const [formData, setFormData] = useState<SodaInventoryInsert>({
    name: "",
    quantity: 0,
    price: 0
  });
  const { toast } = useToast();

  // Cargar datos del inventario
  useEffect(() => {
    fetchSodas();
  }, []);

  const fetchSodas = async () => {
    setLoading(true);
    setError(null); // Resetear error antes de cada fetch
    const { data, error: fetchError } = await supabase
      .from("soda_inventory")
      .select("*")
      .order("name");

    if (fetchError) {
      toast({
        title: "Error al cargar inventario",
        description: fetchError.message,
        variant: "destructive"
      });
      setError(fetchError.message); // Guardar el mensaje de error
    } else {
      setSodas(data || []);
    }
    setLoading(false);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantity" || name === "price" ? parseFloat(value) : value
    });
  };

  // Agregar nueva bebida
  const handleAddSoda = async () => {
    // Validación de campos
    if (!formData.name || formData.name.trim() === "") {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa el nombre de la bebida.",
        variant: "destructive"
      });
      return;
    }
    if (formData.quantity == null || isNaN(formData.quantity) || formData.quantity < 0) {
      toast({
        title: "Cantidad inválida",
        description: "Por favor ingresa una cantidad válida (mayor o igual a 0).",
        variant: "destructive"
      });
      return;
    }
    if (formData.price == null || isNaN(formData.price) || formData.price < 0) {
      toast({
        title: "Precio inválido",
        description: "Por favor ingresa un precio válido (mayor o igual a 0).",
        variant: "destructive"
      });
      return;
    }
    const { error } = await supabase
      .from("soda_inventory")
      .insert(formData);

    if (error) {
      toast({
        title: "Error al agregar bebida",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Bebida agregada",
        description: `${formData.name} ha sido agregada al inventario.`
      });
      setIsAddDialogOpen(false);
      resetForm();
      fetchSodas();
    }
  };

  // Editar bebida existente
  const handleEditSoda = async () => {
    if (!currentSoda) return;
    // Logs temporales para depuración
    console.log("[DEBUG] updates:", formData);
    console.log("[DEBUG] currentSoda.id:", currentSoda.id);
    // Validación de campos
    if (!formData.name || formData.name.trim() === "") {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa el nombre de la bebida.",
        variant: "destructive"
      });
      return;
    }
    if (formData.quantity == null || isNaN(formData.quantity) || formData.quantity < 0) {
      toast({
        title: "Cantidad inválida",
        description: "Por favor ingresa una cantidad válida (mayor o igual a 0).",
        variant: "destructive"
      });
      return;
    }
    if (formData.price == null || isNaN(formData.price) || formData.price < 0) {
      toast({
        title: "Precio inválido",
        description: "Por favor ingresa un precio válido (mayor o igual a 0).",
        variant: "destructive"
      });
      return;
    }
    // Siempre incluir el campo price en la actualización
    const updates: SodaInventoryUpdate = {
      name: formData.name,
      quantity: formData.quantity,
      price: formData.price
    };
    // Log para verificar el objeto updates
    console.log("[DEBUG] updates enviados:", updates);
    const { error } = await supabase
      .from("soda_inventory")
      .update(updates)
      .eq("id", currentSoda.id);
    if (error) {
      toast({
        title: "Error al actualizar bebida",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Bebida actualizada",
        description: `${formData.name} ha sido actualizada.`
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchSodas();
    }
  };

  // Eliminar bebida
  const handleDeleteSoda = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta bebida?")) return;

    const { error } = await supabase
      .from("soda_inventory")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error al eliminar bebida",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Bebida eliminada",
        description: "La bebida ha sido eliminada del inventario."
      });
      fetchSodas();
    }
  };

  // Abrir diálogo de edición
  const openEditDialog = (soda: SodaInventory) => {
    setCurrentSoda(soda);
    setFormData({
      name: soda.name,
      quantity: soda.quantity,
      price: soda.price
    });
    setIsEditDialogOpen(true);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: "",
      quantity: 0,
      price: 0
    });
    setCurrentSoda(null);
  };

  return (
    <Card className="mb-8 max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventario de Bebidas</CardTitle>
        {isAdmin && <Button onClick={() => setIsAddDialogOpen(true)}>Agregar Bebida</Button>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : error ? ( // Mostrar error si existe
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-500">
                  Error al cargar datos: {error}
                </TableCell>
              </TableRow>
            ) : sodas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay bebidas en el inventario
                </TableCell>
              </TableRow>
            ) : (
              sodas.map((soda) => (
                <TableRow key={soda.id}>
                  <TableCell>{soda.name}</TableCell>
                  <TableCell>{soda.quantity}</TableCell>
                  <TableCell>{soda.price != null ? `$${soda.price.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {isAdmin && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(soda)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSoda(soda.id)}
                          >
                            Eliminar
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Diálogo para agregar bebida */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Bebida</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Cantidad
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Precio
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSoda} disabled={!isAdmin}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo para editar bebida */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Bebida</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quantity" className="text-right">
                  Cantidad
                </Label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Precio
                </Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditSoda} disabled={!isAdmin}>Actualizar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}