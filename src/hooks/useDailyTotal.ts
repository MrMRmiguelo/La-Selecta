
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useDailyTotal() {
  const [dailyTotal, setDailyTotal] = useState(0);

  useEffect(() => {
    const fetchTodayTotal = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_totals')
        .select('total')
        .eq('date', today);
        // No usar .single() para evitar error 406 si no hay fila

      if (error) {
        console.error('Error fetching daily total:', error);
        setDailyTotal(0); // O manejar el error como prefieras
      } else if (data && data.length > 0 && typeof data[0].total === 'number') {
        // Si hay datos, tomar el total del primer (y único esperado) registro
        setDailyTotal(data[0].total);
      } else {
        // Si no hay datos para hoy, el total es 0
        setDailyTotal(0);
      }
    };
    fetchTodayTotal();
  }, []);

  const addToDailyTotal = async (amount: number) => {
    const newTotal = dailyTotal + amount;
    setDailyTotal(newTotal);

    // Update or insert daily total in the database
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('daily_totals')
      .upsert(
        { 
          date: today, 
          total: newTotal 
        },
        { 
          onConflict: 'date',
          ignoreDuplicates: false 
        }
      );

    if (error) {
      console.error('Error updating daily total:', error);
    }
  };

  return { dailyTotal, addToDailyTotal };
}
