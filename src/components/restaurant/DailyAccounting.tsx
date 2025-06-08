import React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ExpensesAndCashRegister } from "./ExpensesAndCashRegister";
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

export function DailyAccounting() {
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [saleDetail, setSaleDetail] = useState<DailySaleDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Solo mostrar los últimos 7 días
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const handleExpensesTotalChange = (total: number) => {
    setTotalExpenses(total);
  };

  useEffect(() => {
    const fetchDailyTotals = async () => {
      const startDateStr = format(sevenDaysAgo, 'yyyy-MM-dd');
      const endDateStr = format(today, 'yyyy-MM-dd');
      
      console.log('[DEBUG] Fetching daily totals between:', startDateStr, 'and', endDateStr);
      
      const { data, error } = await supabase
        .from('daily_totals')
        .select('date, total')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching daily totals:', error);
        if (error.message?.includes('relation "daily_totals" does not exist')) {
          console.warn('Tabla daily_totals no existe. Mostrando datos vacíos.');
          setDailyTotals([]);
          return;
        }
        return;
      }

      setDailyTotals(data || []);
    };

    fetchDailyTotals();
  }, []);

  const handleDateClick = async (date: string) => {
    setSelectedDate(date);
    setDetailOpen(true);
    setIsLoadingHistory(true);
    
    const formattedDate = date.split('T')[0];
    
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
      if (dailyError?.message?.includes('relation "daily_totals" does not exist')) {
        setSaleDetail({ date: formattedDate, total: 0 });
      } else {
        setSaleDetail(null);
      }
    }
    
    // Obtener el historial de órdenes para ese día
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ventas Diarias</CardTitle>
          <CardDescription>
            Últimos 7 días de ventas y gestión de caja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyTotalsTable dailyTotals={dailyTotals} onDateClick={handleDateClick} />
            <div>
              <ExpensesAndCashRegister 
                startDate={sevenDaysAgo}
                endDate={today}
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
              <div className="mb-2 font-semibold">Fecha: {
                saleDetail.date ? (
                  (() => {
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
                              L {order.total?.toFixed(2)}
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
                  {orderHistory.length > 0 ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2">Platos vendidos</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead className="text-right">Cantidad</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              const foodItems: { [key: string]: { name: string; quantity: number; total: number } } = {};
                              
                              orderHistory.forEach(order => {
                                if (order.food && Array.isArray(order.food)) {
                                  order.food.forEach((item: any) => {
                                    const key = item.name || 'Producto sin nombre';
                                    const quantity = item.quantity || 1;
                                    const price = item.price || 0;
                                    
                                    if (!foodItems[key]) {
                                      foodItems[key] = { name: key, quantity: 0, total: 0 };
                                    }
                                    foodItems[key].quantity += quantity;
                                    foodItems[key].total += price * quantity;
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
                        <h4 className="font-semibold mb-2">Bebidas vendidas</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead className="text-right">Cantidad</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              const sodaItems: { [key: string]: { name: string; quantity: number; total: number } } = {};
                              
                              orderHistory.forEach(order => {
                                if (order.soda_order && Array.isArray(order.soda_order)) {
                                  order.soda_order.forEach((soda: any) => {
                                    const key = soda.name || 'Bebida sin nombre';
                                    const quantity = soda.quantity || 1;
                                    const price = soda.price || 0;
                                    
                                    if (!sodaItems[key]) {
                                      sodaItems[key] = { name: key, quantity: 0, total: 0 };
                                    }
                                    sodaItems[key].quantity += quantity;
                                    sodaItems[key].total += price * quantity;
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