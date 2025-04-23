
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { MonthlyTotal } from "./MonthlyTotal";
import { MonthlyExpenses } from "./MonthlyExpenses";
import { DailyTotalsChart } from "./DailyTotalsChart";
import { DailyTotalsTable } from "./DailyTotalsTable";

interface DailyTotal {
  date: string;
  total: number;
}

export function MonthlyAccounting() {
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [selectedMonth] = useState(new Date());
  const startDate = startOfMonth(selectedMonth);
  const endDate = endOfMonth(selectedMonth);

  useEffect(() => {
    const fetchDailyTotals = async () => {
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
  }, [startDate, endDate]);

  const handleExpensesTotalChange = (total: number) => {
    setMonthlyExpenses(total);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Contabilidad de {format(selectedMonth, 'MMMM yyyy', { locale: es })}
          </CardTitle>
          <CardDescription>
            Resumen financiero del mes actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyTotal 
            total={monthlyTotal} 
            month={selectedMonth}
            expenses={monthlyExpenses} 
          />
          <DailyTotalsChart dailyTotals={dailyTotals} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <DailyTotalsTable dailyTotals={dailyTotals} />
            <MonthlyExpenses 
              startDate={startDate}
              endDate={endDate}
              onTotalChange={handleExpensesTotalChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
