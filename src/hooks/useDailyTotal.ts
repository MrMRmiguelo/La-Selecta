
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
        .eq('date', today)
        .single();
      if (!error && data && typeof data.total === 'number') {
        setDailyTotal(data.total);
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
