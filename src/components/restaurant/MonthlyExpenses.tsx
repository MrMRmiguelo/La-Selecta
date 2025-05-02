
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DailyIncomeItem {
  date: string;
  amount: number;
  description: string;
}

interface DailyIncomeProps {
  startDate: Date;
  endDate: Date;
  onTotalChange: (total: number) => void;
}

export function MonthlyExpenses({ startDate, endDate, onTotalChange }: DailyIncomeProps) {
  const [incomes, setIncomes] = useState<DailyIncomeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      
      try {
        // Consulta de órdenes del día actual
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
          .from('table_orders_history')
          .select('created_at, total, table_number, food, soda_order')
          .gte('created_at', today.toISOString())
          .lte('created_at', new Date().toISOString())
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching incomes:', error);
          setIncomes([]);
          onTotalChange(0);
          return;
        }
        
        // Transformar órdenes en ingresos
        const incomesData = data?.map(order => {
          // Obtener los detalles de comida y bebidas
          const foodItems = order.food || [];
          const sodaItems = order.soda_order || [];
          const foodDescription = foodItems.map((item: any) => `${item.quantity}x ${item.name}`).join(', ');
          const sodaDescription = sodaItems.map((item: any) => `${item.quantity}x ${item.name}`).join(', ');
          
          // Crear la descripción completa
          const description = `Mesa #${order.table_number} - ${foodDescription}${sodaDescription ? `, ${sodaDescription}` : ''}`;
          
          return {
            date: order.created_at,
            amount: parseFloat(order.total.toFixed(2)),
            description: description
          };
        }) || [];
        
        setIncomes(incomesData);
        
        // Actualizar el total de ingresos
        const total = incomesData.reduce((sum, inc) => sum + inc.amount, 0);
        onTotalChange(total);
      } catch (e) {
        console.error('Error in income calculation:', e);
        setIncomes([]);
        onTotalChange(0);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [startDate, endDate, onTotalChange]);

  if (loading) {
    return <div className="p-4 text-center">Cargando ingresos...</div>;
  }

  if (incomes.length === 0) {
    return <div className="p-4 text-center">No hay ingresos registrados hoy</div>;
  }

  const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Ingresos del Día</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.map((income, index) => (
              <TableRow key={index}>
                <TableCell>
                  {format(new Date(income.date), 'HH:mm', { locale: es })}
                </TableCell>
                <TableCell>{income.description}</TableCell>
                <TableCell className="text-right text-green-600">
                  L {income.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50">
              <TableCell colSpan={2} className="font-bold">Total Ingresos</TableCell>
              <TableCell className="text-right font-bold text-green-600">
                L {totalIncomes.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
