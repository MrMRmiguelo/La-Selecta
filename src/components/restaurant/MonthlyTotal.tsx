
interface MonthlyTotalProps {
  total: number;
  month: Date;
  expenses?: number;
}

export function MonthlyTotal({ total, month, expenses = 0 }: MonthlyTotalProps) {
  const profit = total - expenses;
  
  return (
    <div className="mb-6 space-y-2">
      <div className="text-2xl font-bold flex justify-between items-center">
        <span>Total del mes:</span>
        <span className="text-green-600">L {total.toFixed(2)}</span>
      </div>
      
      {expenses > 0 && (
        <>
          <div className="text-xl flex justify-between items-center">
            <span>Gastos:</span>
            <span className="text-red-600">L {expenses.toFixed(2)}</span>
          </div>
          
          <div className="text-xl flex justify-between items-center border-t pt-2">
            <span>Ganancia neta:</span>
            <span className={profit >= 0 ? "text-green-600" : "text-red-600"}>
              L {profit.toFixed(2)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
