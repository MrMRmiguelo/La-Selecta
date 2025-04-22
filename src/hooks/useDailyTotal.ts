
import { useState, useCallback } from "react";

export function useDailyTotal(initialTotal: number = 0) {
  const [dailyTotal, setDailyTotal] = useState(initialTotal);

  const addToDailyTotal = useCallback((amount: number) => {
    if (amount && amount > 0) {
      setDailyTotal(prev => prev + amount);
    }
  }, []);

  return { dailyTotal, addToDailyTotal };
}
