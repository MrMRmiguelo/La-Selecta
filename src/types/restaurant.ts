
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
export interface TableFoodItem {
  itemId: number;
  quantity: number;
}

