
interface MonthlyTotalProps {
  total: number;
  month: Date;
}

export function MonthlyTotal({ total, month }: MonthlyTotalProps) {
  return (
    <div className="mb-6">
      <div className="text-2xl font-bold">
        Total del mes: L {total.toFixed(2)}
      </div>
    </div>
  );
}
