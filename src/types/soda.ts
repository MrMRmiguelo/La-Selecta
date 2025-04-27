export interface SodaInventory {
  id: string;
  name: string;
  brand: string;
  quantity: number;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface SodaInventoryInsert {
  name: string;
  brand: string;
  quantity: number;
  price: number;
}

export interface SodaInventoryUpdate {
  name?: string;
  brand?: string;
  quantity?: number;
  price?: number;
}