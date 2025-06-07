import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { RestaurantLayout } from "@/components/layout/RestaurantLayout";
import { MenuItem } from "@/types/restaurant";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, ChefHat } from "lucide-react";

const MenuManagement = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [newDishName, setNewDishName] = useState("");
  const [newDishPrice, setNewDishPrice] = useState("");
  const [selectedKitchen, setSelectedKitchen] = useState<'buffet' | 'cocina adentro' | 'cocina afuera'>('buffet');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const { data, error } = await supabase.from("menu").select("*").order("id");
    if (!error && data) {
      setMenu(data);
    }
  };

  const handleAddMenuItem = async () => {
    if (!newDishName.trim() || isNaN(Number(newDishPrice))) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre válido y un precio numérico.",
        variant: "destructive"
      });
      return;
    }

    const newItem = {
      name: newDishName.trim(),
      price: Number(newDishPrice),
      tipo_cocina: selectedKitchen
    };

    const { data, error } = await supabase.from("menu").insert(newItem).select();
    
    if (error) {
      toast({
        title: "Error al agregar plato",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    if (data && data.length > 0) {
      setMenu(prev => [...prev, data[0]]);
      setNewDishName("");
      setNewDishPrice("");
      setSelectedKitchen('buffet');
      setAddDialogOpen(false);
      toast({
        title: "Plato agregado",
        description: `${newItem.name} ha sido agregado al menú.`
      });
    }
  };

  const handleEditMenuItem = async () => {
    if (!editingItem || !editingItem.name.trim() || isNaN(Number(editingItem.price))) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre válido y un precio numérico.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from("menu")
      .update({
        name: editingItem.name.trim(),
        price: editingItem.price,
        tipo_cocina: editingItem.tipo_cocina
      })
      .eq("id", editingItem.id);

    if (error) {
      toast({
        title: "Error al actualizar plato",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setMenu(prev => prev.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    setEditingItem(null);
    setEditDialogOpen(false);
    toast({
      title: "Plato actualizado",
      description: `${editingItem.name} ha sido actualizado.`
    });
  };

  const handleRemoveMenuItem = async (dishId: number) => {
    const { error } = await supabase.from("menu").delete().eq("id", dishId);
    if (!error) {
      setMenu(prev => prev.filter(item => item.id !== dishId));
      toast({
        title: "Plato eliminado",
        description: "El plato ha sido eliminado del menú."
      });
    } else {
      toast({
        title: "Error al eliminar plato",
        description: error.message,
        variant: "destructive"
      });
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
            <h1 className="text-3xl font-bold text-gray-800">Gestión del Menú</h1>
            <p className="text-gray-600 mt-2">Administra los platos disponibles en el restaurante</p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Plato
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Plato</DialogTitle>
                <DialogDescription>
                  Completa la información del nuevo plato para agregarlo al menú.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    className="col-span-3"
                    placeholder="Nombre del plato"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Precio
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    className="col-span-3"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kitchen" className="text-right">
                    Cocina
                  </Label>
                  <Select
                    value={selectedKitchen}
                    onValueChange={(value: 'buffet' | 'cocina adentro' | 'cocina afuera') => setSelectedKitchen(value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buffet">Buffet</SelectItem>
                      <SelectItem value="cocina adentro">Cocina Adentro</SelectItem>
                      <SelectItem value="cocina afuera">Cocina Afuera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddMenuItem}>Agregar Plato</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {Object.entries(groupedMenu).map(([kitchen, items]) => (
            <Card key={kitchen}>
              <CardHeader>
                <CardTitle className="capitalize">{kitchen}</CardTitle>
                <CardDescription>
                  {items.length} plato{items.length !== 1 ? 's' : ''} disponible{items.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">L {item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMenuItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialog para editar plato */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Plato</DialogTitle>
              <DialogDescription>
                Modifica la información del plato.
              </DialogDescription>
            </DialogHeader>
            {editingItem && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="edit-name"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-price" className="text-right">
                    Precio
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({...editingItem, price: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-kitchen" className="text-right">
                    Cocina
                  </Label>
                  <Select
                    value={editingItem.tipo_cocina}
                    onValueChange={(value: 'buffet' | 'cocina adentro' | 'cocina afuera') => 
                      setEditingItem({...editingItem, tipo_cocina: value})
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buffet">Buffet</SelectItem>
                      <SelectItem value="cocina adentro">Cocina Adentro</SelectItem>
                      <SelectItem value="cocina afuera">Cocina Afuera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleEditMenuItem}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RestaurantLayout>
  );
};

export default MenuManagement;