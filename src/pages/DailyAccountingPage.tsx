import React from "react";
import { RestaurantLayout } from "@/components/layout/RestaurantLayout";
import { DailyAccounting } from "@/components/restaurant/DailyAccounting";

const DailyAccountingPage = () => {
  return (
    <RestaurantLayout>
      <div className="p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Ventas Diarias</h1>
          <p className="text-gray-500">Gestión de caja y ventas del día</p>
        </header>
        <DailyAccounting />
      </div>
    </RestaurantLayout>
  );
};

export default DailyAccountingPage;