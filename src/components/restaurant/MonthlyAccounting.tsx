
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface DailyTotal {
  date: string;
  total: number;
}

export function MonthlyAccounting() {
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [selectedMonth] = useState(new Date());

  useEffect(() => {
    const fetchDailyTotals = async () => {
      const startDate = startOfMonth(selectedMonth);
      const endDate = endOfMonth(selectedMonth);

      const { data, error } = await supabase
        .from('daily_totals')
        .select('date, total')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date');

      if (error) {
        console.error('Error fetching daily totals:', error);
        return;
      }

      setDailyTotals(data);
      setMonthlyTotal(data.reduce((sum, day) => sum + day.total, 0));
    };

    fetchDailyTotals();
  }, [selectedMonth]);

  const chartData = dailyTotals.map(day => ({
    date: format(new Date(day.date), 'dd', { locale: es }),
    total: day.total
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Contabilidad de {format(selectedMonth, 'MMMM yyyy', { locale: es })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="text-2xl font-bold">
              Total del mes: L {monthlyTotal.toFixed(2)}
            </div>
          </div>
          
          <div className="h-[300px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyTotals.map((day) => (
                <TableRow key={day.date}>
                  <TableCell>
                    {format(new Date(day.date), 'dd MMMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell className="text-right">
                    L {day.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
