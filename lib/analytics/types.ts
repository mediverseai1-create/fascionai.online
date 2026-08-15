export interface ProductRow {
  id: string;
  sku: string;
  style_name: string;
  category: string | null;
  color: string | null;
  size: string | null;
  cost: number | null;
  price: number | null;
}

export interface SaleRow {
  id: string;
  product_id: string;
  quantity: number;
  revenue: number;
  sold_at: string; // ISO date
}

export interface InventorySnapshotRow {
  id: string;
  product_id: string;
  quantity_on_hand: number;
  as_of_date: string; // ISO date
  lead_time_days: number | null;
}
