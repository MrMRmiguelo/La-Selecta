
import React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { MonthlyTotal } from "./MonthlyTotal";
import { MonthlyExpenses } from "./MonthlyExpenses";
import { ExpensesAndCashRegister } from "./ExpensesAndCashRegister";
import { DailyTotalsChart } from "./DailyTotalsChart";
import { DailyTotalsTable } from "./DailyTotalsTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DailyTotal {
  date: string;
  total: number;
  food_items?: { itemId: number; quantity: number }[];
  soda_items?: { sodaId: string; quantity: number }[];
}

interface DailySaleDetail {
  date: string;
  total: number;
}

interface OrderHistoryItem {
  id: number;
  table_id: number;
  table_number: number;
  food: any[];
  extras: any[];
  soda_order: any[];
  total: number;
  created_at: string;
}

export function MonthlyAccounting() {
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  // Nuevo estado para el rango de fechas
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [saleDetail, setSaleDetail] = useState<DailySaleDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const startDate = dateRange.start;
  const endDate = dateRange.end;

  const handleExpensesTotalChange = (total: number) => {
    setTotalExpenses(total);
  };

  useEffect(() => {
    const fetchDailyTotals = async () => {
      // Formatear fechas para consulta a la base de datos
      // Usamos formato YYYY-MM-DD para evitar problemas de zona horaria
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      console.log('[DEBUG] Fetching daily totals between:', startDateStr, 'and', endDateStr);
      
      const { data, error } = await supabase
        .from('daily_totals')
        .select('date, total')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date');

      if (error) {
        console.error('Error fetching daily totals:', error);
        // Si la tabla no existe, crear datos vacíos para evitar errores
        if (error.message?.includes('relation "daily_totals" does not exist')) {
          console.warn('Tabla daily_totals no existe. Mostrando datos vacíos.');
          setDailyTotals([]);
          return;
        }
        return;
      }

      setDailyTotals(data || []);
      setMonthlyTotal((data || []).reduce((sum, day) => sum + day.total, 0));
    };

    fetchDailyTotals();
  }, [startDate, endDate]);

  const handleDateClick = async (date: string) => {
    setSelectedDate(date);
    setDetailOpen(true);
    setIsLoadingHistory(true);
    
    // Asegurar que la fecha esté en formato YYYY-MM-DD para la consulta
    // Esto evita problemas de zona horaria al consultar la base de datos
    const formattedDate = date.split('T')[0]; // En caso de que venga con timestamp
    
    console.log('[DEBUG] Fetching details for date:', formattedDate);
    
    // Obtener el total diario
    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_totals')
      .select('date, total')
      .eq('date', formattedDate)
      .single();
      
    if (!dailyError && dailyData) {
      setSaleDetail(dailyData);
    } else {
      console.error('Error fetching sale detail:', dailyError);
      // Si la tabla no existe, mostrar datos vacíos
      if (dailyError?.message?.includes('relation "daily_totals" does not exist')) {
        setSaleDetail({ date: formattedDate, total: 0 });
      } else {
        setSaleDetail(null);
      }
    }
    
    // Obtener el historial de órdenes para ese día
    // Necesitamos convertir la fecha a un rango para capturar todas las órdenes del día
    const startOfDay = `${formattedDate}T00:00:00`;
    const endOfDay = `${formattedDate}T23:59:59`;
    
    const { data: historyData, error: historyError } = await supabase
      .from('table_orders_history')
      .select('*')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: false });
    
    if (!historyError && historyData) {
      setOrderHistory(historyData);
      console.log('[DEBUG] Order history:', historyData);
    } else {
      console.error('Error fetching order history:', historyError);
      setOrderHistory([]);
    }
    
    setIsLoadingHistory(false);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSaleDetail(null);
    setSelectedDate(null);
    setOrderHistory([]);
  };

  // Función para manejar el cambio de rango de fechas con corrección de zona horaria
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
    const value = e.target.value;
    let newDate;
    
    // Check if the input value is empty or results in an invalid date
    if (!value || isNaN(new Date(value).getTime())) {
      newDate = new Date(); // Set to today's date if empty or invalid
    } else {
      // Crear la fecha correctamente para evitar problemas de zona horaria
      // Formato esperado: yyyy-MM-dd
      const [year, month, day] = value.split('-').map(num => parseInt(num, 10));
      // Crear fecha usando UTC para evitar ajustes de zona horaria
      newDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    }
    
    console.log(`[DEBUG] Fecha seleccionada (${type}):`, value, 'convertida a:', newDate.toISOString());
    
    setDateRange(prev => ({
      ...prev,
      [type]: newDate
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
              <input 
                type="date" 
                value={format(dateRange.start, 'yyyy-MM-dd')} 
                onChange={e => handleRangeChange(e, 'start')} 
                className="border rounded px-2 py-1" 
              />
            </div>
            <div>
              <label className="mr-2 font-semibold">Hasta:</label>
              <input 
                type="date" 
                value={format(dateRange.end, 'yyyy-MM-dd')} 
                onChange={e => handleRangeChange(e, 'end')} 
                className="border rounded px-2 py-1" 
              />
            </div>
          </div>
          <MonthlyTotal 
            total={monthlyTotal} 
            month={dateRange.start}
            expenses={totalExpenses} 
          />
          <DailyTotalsChart dailyTotals={dailyTotals} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <DailyTotalsTable dailyTotals={dailyTotals} onDateClick={handleDateClick} />
            <div>
              <ExpensesAndCashRegister 
                startDate={startDate}
                endDate={endDate}
                onExpensesTotalChange={handleExpensesTotalChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={detailOpen} onOpenChange={handleCloseDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de ventas del día</DialogTitle>
          </DialogHeader>
          {saleDetail ? (
            <div>
              {/* Corrección: Analizar la fecha manualmente para evitar problemas de zona horaria */}
              <div className="mb-2 font-semibold">Fecha: {
                saleDetail.date ? (
                  (() => {
                    // Crear fecha usando UTC para evitar ajustes de zona horaria
                    const [year, month, day] = saleDetail.date.split('-').map(num => parseInt(num, 10));
                    const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
                    return format(dateObj, 'dd/MM/yyyy', { locale: es });
                  })()
                ) : 'Fecha inválida'
              }</div>
              <div className="mb-4 text-lg font-bold">Total del día: L {saleDetail.total?.toFixed(2)}</div>
              
              <Tabs defaultValue="orders" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="orders">Órdenes</TabsTrigger>
                  <TabsTrigger value="items">Productos vendidos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders" className="space-y-4">
                  {isLoadingHistory ? (
                    <div className="text-center py-4">Cargando historial de órdenes...</div>
                  ) : orderHistory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hora</TableHead>
                          <TableHead>Mesa</TableHead>
                          <TableHead>Platos</TableHead>
                          <TableHead>Bebidas</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderHistory.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              {format(new Date(order.created_at), 'HH:mm', { locale: es })}
                            </TableCell>
                            <TableCell>Mesa {order.table_number}</TableCell>
                            <TableCell>
                              {order.food && order.food.length > 0 ? (
                                <ul className="list-disc list-inside">
                                  {order.food.map((item: any, index: number) => (
                                    <li key={index}>
                                      {item.name} x{item.quantity || 1}
                                      {item.nota && <span className="text-gray-500 text-xs"> ({item.nota})</span>}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {order.soda_order && order.soda_order.length > 0 ? (
                                <ul className="list-disc list-inside">
                                  {order.soda_order.map((soda: any, index: number) => (
                                    <li key={index}>
                                      {soda.name} x{soda.quantity || 1}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              L {order.total.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">No hay órdenes registradas para este día.</div>
                  )}
                </TabsContent>
                
                <TabsContent value="items" className="space-y-4">
                  {isLoadingHistory ? (
                    <div className="text-center py-4">Cargando productos vendidos...</div>
                  ) : orderHistory.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Platos vendidos</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Plato</TableHead>
                              <TableHead className="text-right">Cantidad</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              // Agrupar platos vendidos
                              const foodItems: Record<string, {name: string, quantity: number, total: number}> = {};
                              
                              orderHistory.forEach(order => {
                                if (order.food && Array.isArray(order.food)) {
                                  order.food.forEach((item: any) => {
                                    const itemName = item.name;
                                    const itemQty = item.quantity || 1;
                                    const itemPrice = item.price || 0;
                                    const itemExtra = item.precioExtra || 0;
                                    const itemTotal = (itemPrice + itemExtra) * itemQty;
                                    
                                    if (foodItems[itemName]) {
                                      foodItems[itemName].quantity += itemQty;
                                      foodItems[itemName].total += itemTotal;
                                    } else {
                                      foodItems[itemName] = {
                                        name: itemName,
                                        quantity: itemQty,
                                        total: itemTotal
                                      };
                                    }
                                  });
                                }
                              });
                              
                              return Object.values(foodItems).map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell className="text-right">{item.quantity}</TableCell>
                                  <TableCell className="text-right">L {item.total.toFixed(2)}</TableCell>
                                </TableRow>
                              ));
                            })()} 
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Bebidas vendidas</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Bebida</TableHead>
                              <TableHead className="text-right">Cantidad</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              // Agrupar bebidas vendidas
                              const sodaItems: Record<string, {name: string, quantity: number, total: number}> = {};
                              
                              orderHistory.forEach(order => {
                                if (order.soda_order && Array.isArray(order.soda_order)) {
                                  order.soda_order.forEach((soda: any) => {
                                    const sodaName = soda.name;
                                    const sodaQty = soda.quantity || 1;
                                    const sodaPrice = soda.price || 0;
                                    const sodaTotal = sodaPrice * sodaQty;
                                    
                                    if (sodaItems[sodaName]) {
                                      sodaItems[sodaName].quantity += sodaQty;
                                      sodaItems[sodaName].total += sodaTotal;
                                    } else {
                                      sodaItems[sodaName] = {
                                        name: sodaName,
                                        quantity: sodaQty,
                                        total: sodaTotal
                                      };
                                    }
                                  });
                                }
                              });
                              
                              return Object.values(sodaItems).map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell className="text-right">{item.quantity}</TableCell>
                                  <TableCell className="text-right">L {item.total.toFixed(2)}</TableCell>
                                </TableRow>
                              ));
                            })()} 
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">No hay productos vendidos registrados para este día.</div>
                  )}
                </TabsContent>
              </Tabs>
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
