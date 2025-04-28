
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DailySale {
  date: string;
  total: number;
  food_items: { itemId: number; quantity: number }[];
  soda_items: { sodaId: string; quantity: number }[];
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
          <TableHead>Alimentos vendidos</TableHead>
          <TableHead>Bebidas vendidas</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dailyTotals.map((day) => (
          <TableRow key={day.date} className={onDateClick ? "cursor-pointer hover:bg-gray-100" : undefined} onClick={onDateClick ? () => onDateClick(day.date) : undefined}>
            <TableCell>
              {format(new Date(day.date), 'dd/MM/yyyy', { locale: es })}
            </TableCell>
            <TableCell>
              {day.food_items && day.food_items.length > 0 ? (
                <ul>
                  {day.food_items.map((item, idx) => (
                    <li key={idx}>ID {item.itemId}: x{item.quantity}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-400">Ninguno</span>
              )}
            </TableCell>
            <TableCell>
              {day.soda_items && day.soda_items.length > 0 ? (
                <ul>
                  {day.soda_items.map((item, idx) => (
                    <li key={idx}>ID {item.sodaId}: x{item.quantity}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-400">Ninguna</span>
              )}
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
