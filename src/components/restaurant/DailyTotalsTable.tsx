
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DailySale {
  date: string;
  total: number;
  food_items?: { itemId: number; quantity: number }[];
  soda_items?: { sodaId: string; quantity: number }[];
}

interface DailyTotalsTableProps {
  dailyTotals: DailySale[];
  onDateClick?: (date: string) => void;
}

export function DailyTotalsTable({ dailyTotals, onDateClick }: DailyTotalsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dailyTotals.map((day) => (
          <TableRow key={day.date} className={onDateClick ? "cursor-pointer hover:bg-gray-100" : undefined} onClick={onDateClick ? () => onDateClick(day.date) : undefined}>
            <TableCell>
              {format(new Date(day.date), 'dd/MM/yyyy', { locale: es })}
            </TableCell>
            <TableCell className="text-right">
              L {day.total.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
