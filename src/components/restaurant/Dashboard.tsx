
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableProps } from "@/components/restaurant/Table";
import { UserRound, Clock, DollarSign } from "lucide-react";

interface DashboardProps {
  tables: TableProps[];
  dailyTotal?: number;
}

export function Dashboard({ tables, dailyTotal = 0 }: DashboardProps) {
  // Calculate stats
  const totalTables = tables.length;
  const occupiedTables = tables.filter(table => table.status === "occupied").length;
  const occupancyRate = totalTables ? Math.round((occupiedTables / totalTables) * 100) : 0;
  const availableTables = tables.filter(table => table.status === "free").length;
  const reservedTables = tables.filter(table => table.status === "reserved").length;
  
  // Calculate total guests
  const totalGuests = tables
    .filter(table => table.status === "occupied" && table.customer)
    .reduce((total, table) => total + (table.customer?.partySize || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ocupación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{occupancyRate}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            {occupiedTables} de {totalTables} mesas ocupadas
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-restaurant-accent" 
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Estado de Mesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div>
              <div className="font-bold text-xl">{availableTables}</div>
              <div className="text-xs flex items-center">
                <div className="w-2 h-2 rounded-full bg-restaurant-free mr-1"></div>
                Libres
              </div>
            </div>
            <div>
              <div className="font-bold text-xl">{occupiedTables}</div>
              <div className="text-xs flex items-center">
                <div className="w-2 h-2 rounded-full bg-restaurant-occupied mr-1"></div>
                Ocupadas
              </div>
            </div>
            <div>
              <div className="font-bold text-xl">{reservedTables}</div>
              <div className="text-xs flex items-center">
                <div className="w-2 h-2 rounded-full bg-restaurant-reserved mr-1"></div>
                Reservadas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <UserRound className="mr-2" size={16} />
            Clientes Actuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalGuests}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Personas en el restaurante
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2 flex flex-row gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <DollarSign className="mr-2" size={16} />
            Contabilidad del Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${dailyTotal.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Total vendido hoy
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

