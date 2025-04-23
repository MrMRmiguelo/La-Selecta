
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DailyTotal {
  date: string;
  total: number;
}

interface DailyTotalsTableProps {
  dailyTotals: DailyTotal[];
}

export function DailyTotalsTable({ dailyTotals }: DailyTotalsTableProps) {
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
          <TableRow key={day.date}>
            <TableCell>
              {format(new Date(day.date), 'dd MMMM yyyy', { locale: es })}
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
