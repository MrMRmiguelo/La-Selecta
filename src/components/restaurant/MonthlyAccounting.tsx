
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { MonthlyTotal } from "./MonthlyTotal";
import { MonthlyExpenses } from "./MonthlyExpenses";
import { DailyTotalsChart } from "./DailyTotalsChart";
import { DailyTotalsTable } from "./DailyTotalsTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DailyTotal {
  date: string;
  total: number;
  food_items: { itemId: number; quantity: number }[];
  soda_items: { sodaId: string; quantity: number }[];
}

interface DailySaleDetail {
  date: string;
  total: number;
  food_items: { itemId: number; quantity: number }[];
  soda_items: { sodaId: string; quantity: number }[];
}

export function MonthlyAccounting() {
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  // Nuevo estado para el rango de fechas
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [saleDetail, setSaleDetail] = useState<DailySaleDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const startDate = dateRange.start;
  const endDate = dateRange.end;

  useEffect(() => {
    const fetchDailyTotals = async () => {
      const { data, error } = await supabase
        .from('daily_sales')
        .select('date: sale_date, total, food_items, soda_items')
        .gte('sale_date', startDate.toISOString())
        .lte('sale_date', endDate.toISOString())
        .order('sale_date');

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

  const handleDateClick = async (date: string) => {
    setSelectedDate(date);
    setDetailOpen(true);
    // Consultar detalle de ventas para la fecha seleccionada
    const { data, error } = await supabase
      .from('daily_sales')
      .select('date: sale_date, total, food_items, soda_items')
      .eq('sale_date', date)
      .single();
    if (!error && data) {
      setSaleDetail(data);
    } else {
      setSaleDetail(null);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSaleDetail(null);
    setSelectedDate(null);
  };

  // Nuevo: función para manejar el cambio de rango de fechas
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
    const value = e.target.value;
    setDateRange(prev => ({
      ...prev,
      [type]: new Date(value)
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Contabilidad de {format(dateRange.start, 'dd/MM/yyyy', { locale: es })}
          </CardTitle>
          <CardDescription>
            Resumen financiero del periodo seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Selector de rango de fechas */}
          <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
            <div>
              <label className="mr-2 font-semibold">Desde:</label>
              <input type="date" value={format(dateRange.start, 'yyyy-MM-dd')} onChange={e => handleRangeChange(e, 'start')} className="border rounded px-2 py-1" />
            </div>
            <div>
              <label className="mr-2 font-semibold">Hasta:</label>
              <input type="date" value={format(dateRange.end, 'yyyy-MM-dd')} onChange={e => handleRangeChange(e, 'end')} className="border rounded px-2 py-1" />
            </div>
          </div>
          <MonthlyTotal 
            total={monthlyTotal} 
            month={dateRange.start}
            expenses={monthlyExpenses} 
          />
          <DailyTotalsChart dailyTotals={dailyTotals} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <DailyTotalsTable dailyTotals={dailyTotals} onDateClick={handleDateClick} />
            <MonthlyExpenses 
              startDate={startDate}
              endDate={endDate}
              onTotalChange={handleExpensesTotalChange}
            />
          </div>
        </CardContent>
      </Card>
      <Dialog open={detailOpen} onOpenChange={handleCloseDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de ventas del día</DialogTitle>
          </DialogHeader>
          {saleDetail ? (
            <div>
              <div className="mb-2 font-semibold">Fecha: {format(new Date(saleDetail.date), 'dd/MM/yyyy', { locale: es })}</div>
              <div className="mb-2">Total: L {saleDetail.total?.toFixed(2)}</div>
              <div className="mb-2">
                <span className="font-semibold">Platos vendidos:</span>
                {saleDetail.food_items && saleDetail.food_items.length > 0 ? (
                  <ul className="list-disc ml-5">
                    {saleDetail.food_items.map((item, idx) => (
                      <li key={idx}>ID {item.itemId}: x{item.quantity}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400 ml-2">Ninguno</span>
                )}
              </div>
              <div>
                <span className="font-semibold">Bebidas vendidas:</span>
                {saleDetail.soda_items && saleDetail.soda_items.length > 0 ? (
                  <ul className="list-disc ml-5">
                    {saleDetail.soda_items.map((item, idx) => (
                      <li key={idx}>ID {item.sodaId}: x{item.quantity}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400 ml-2">Ninguna</span>
                )}
              </div>
            </div>
          ) : (
            <div>No hay ventas registradas para este día.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { addDays } from "date-fns";
