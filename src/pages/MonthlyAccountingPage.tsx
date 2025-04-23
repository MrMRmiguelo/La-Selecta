
import { RestaurantLayout } from "@/components/layout/RestaurantLayout";
import { MonthlyAccounting } from "@/components/restaurant/MonthlyAccounting";

const MonthlyAccountingPage = () => {
  return (
    <RestaurantLayout>
      <div className="p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Contabilidad Mensual</h1>
          <p className="text-gray-500">Visualiza los totales diarios y mensuales</p>
        </header>
        <MonthlyAccounting />
      </div>
    </RestaurantLayout>
  );
};

export default MonthlyAccountingPage;
