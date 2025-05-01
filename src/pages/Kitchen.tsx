import React from 'react';
import { OrdersTable } from '@/components/restaurant/OrdersTable';
import { RestaurantLayout } from '@/components/layout/RestaurantLayout';

const Kitchen = () => {
  return (
    <RestaurantLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Kitchen Page</h1>
        <OrdersTable />
        <p>Welcome to the kitchen management page.</p>
      </div>
    </RestaurantLayout>
  );
};

export default Kitchen;