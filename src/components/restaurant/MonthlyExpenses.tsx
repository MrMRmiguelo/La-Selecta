
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ExpenseItem {
  date: string;
  amount: number;
  description: string;
}

interface MonthlyExpensesProps {
  startDate: Date;
  endDate: Date;
  onTotalChange: (total: number) => void;
}

export function MonthlyExpenses({ startDate, endDate, onTotalChange }: MonthlyExpensesProps) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      
      try {
        // Consulta de órdenes como gastos (para demostración)
        const { data, error } = await supabase
          .from('orders')
          .select('created_at, details')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
        
        if (error) {
          console.error('Error fetching expenses:', error);
          setExpenses([]);
          onTotalChange(0);
          return;
        }
        
        // Transformar órdenes en gastos para demostración
        const expensesData = data?.map(order => {
          // Asumimos que details puede contener información sobre costos
          const amount = Math.random() * 100; // Demo: costo aleatorio entre 0-100
          
          return {
            date: order.created_at,
            amount: parseFloat(amount.toFixed(2)),
            description: `Insumos para cocina - Orden ${order.created_at}`
          };
        }) || [];
        
        setExpenses(expensesData);
        
        // Actualizar el total de gastos
        const total = expensesData.reduce((sum, exp) => sum + exp.amount, 0);
        onTotalChange(total);
      } catch (e) {
        console.error('Error in expenses calculation:', e);
        setExpenses([]);
        onTotalChange(0);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [startDate, endDate, onTotalChange]);

  if (loading) {
    return <div className="p-4 text-center">Cargando gastos...</div>;
  }

  if (expenses.length === 0) {
    return <div className="p-4 text-center"></div>;
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Gastos Mensuales</CardTitle>
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
            {expenses.map((expense, index) => (
              <TableRow key={index}>
                <TableCell>
                  {format(new Date(expense.date), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell className="text-right text-red-600">
                  L {expense.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50">
              <TableCell colSpan={2} className="font-bold">Total Gastos</TableCell>
              <TableCell className="text-right font-bold text-red-600">
                L {totalExpenses.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
