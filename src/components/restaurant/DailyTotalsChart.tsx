
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DailyTotal {
  date: string;
  total: number;
}

interface DailyTotalsChartProps {
  dailyTotals: DailyTotal[];
}

export function DailyTotalsChart({ dailyTotals }: DailyTotalsChartProps) {
  const chartData = dailyTotals.map(day => ({
    date: format(new Date(day.date), 'dd', { locale: es }),
    total: day.total
  }));

  return (
    <div className="h-[300px] mb-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
