import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Order {
  id: number;
  table_number: number;
  items: Array<{
    name: string;
    quantity: number;
    notes?: string;
  }>;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
}

interface OrdersTableProps {
  readOnly?: boolean;
}

export function OrdersTable({ readOnly = false }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('orders_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `La orden ha sido marcada como ${newStatus === 'in_progress' ? 'en preparación' : 'completada'}`
      });

      fetchOrders();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la orden",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'in_progress':
        return <Badge variant="destructive">En preparación</Badge>;
      case 'completed':
        return <Badge variant="default">Completado</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando órdenes...</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center py-4 text-gray-500">No hay órdenes pendientes</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mesa</TableHead>
          <TableHead>Platos</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Hora</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>Mesa {order.table_number}</TableCell>
            <TableCell>
              <ul className="list-disc list-inside">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.quantity}x {item.name}
                    {item.notes && (
                      <span className="text-gray-500 text-sm"> - {item.notes}</span>
                    )}
                  </li>
                ))}
              </ul>
            </TableCell>
            <TableCell>{getStatusBadge(order.status)}</TableCell>
            <TableCell>
              {new Date(order.created_at).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </TableCell>
            <TableCell>
              {!readOnly && (
                <>
                  {order.status === 'pending' && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'in_progress')}
                      variant="secondary"
                      size="sm"
                    >
                      Iniciar preparación
                    </Button>
                  )}
                  {order.status === 'in_progress' && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      variant="default"
                      size="sm"
                    >
                      Marcar como completado
                    </Button>
                  )}
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}