import { useState } from "react";
import { TableCustomer } from "@/types/restaurant";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserRound, Clock } from "lucide-react";

export type TableStatus = "free" | "occupied" | "reserved";

import { MenuItem, TableFoodItem } from "@/types/restaurant";

export interface TableProps {
  id: number;
  number: number;
  capacity: number;
  status: TableStatus;
  customer?: TableCustomer;
  occupiedAt?: Date;
  onClick?: (tableId: number) => void;
  shape?: "round" | "square" | "rect";
  food?: TableFoodItem[];
}

export function Table({
  id,
  number,
  capacity,
  status,
  customer,
  occupiedAt,
  onClick,
  shape = "round",
  food
}: TableProps) {
  const occupationTime = occupiedAt 
    ? Math.floor((new Date().getTime() - occupiedAt.getTime()) / (1000 * 60)) 
    : 0;

  const tableClasses = cn(
    "cursor-pointer relative flex flex-col items-center justify-center text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg",
    {
      "bg-restaurant-free": status === "free",
      "bg-restaurant-occupied": status === "occupied",
      "bg-restaurant-reserved": status === "reserved",
      "rounded-full aspect-square": shape === "round",
      "rounded-lg aspect-square": shape === "square",
      "rounded-lg h-24 w-32": shape === "rect"
    }
  );

  return (
    <div 
      className={tableClasses} 
      onClick={() => onClick && onClick(id)}
    >
      <div className="text-xl font-bold">{number}</div>
      
      <div className="flex items-center text-xs mt-1">
        <UserRound size={14} />
        <span className="ml-1">{capacity}</span>
      </div>
      
      {status === "occupied" && occupiedAt && (
        <div className="absolute bottom-1 right-1 text-xs flex items-center">
          <Clock size={12} />
          <span className="ml-1">{occupationTime} min</span>
        </div>
      )}
      
      {status === "occupied" && customer && (
        <Badge className="absolute top-0 right-0 bg-black/40">
          {customer.name}
        </Badge>
      )}
    </div>
  );
}
