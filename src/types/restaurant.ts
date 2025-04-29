
export interface TableCustomer {
  name: string;
  partySize: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
}

// Relaciona un alimento con una cantidad seleccionada.
export interface TableFoodItem extends MenuItem {
  quantity: number;
  nota?: string;
  precioExtra?: number;
  sodaId: string;
}

