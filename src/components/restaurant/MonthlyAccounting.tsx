
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { MonthlyTotal } from "./MonthlyTotal";
import { DailyTotalsChart } from "./DailyTotalsChart";
import { DailyTotalsTable } from "./DailyTotalsTable";

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Contabilidad de {format(selectedMonth, 'MMMM yyyy', { locale: es })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyTotal total={monthlyTotal} month={selectedMonth} />
          <DailyTotalsChart dailyTotals={dailyTotals} />
          <DailyTotalsTable dailyTotals={dailyTotals} />
        </CardContent>
      </Card>
    </div>
  );
}
