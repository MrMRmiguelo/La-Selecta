-- Create daily_sales table to store individual sales transactions
CREATE TABLE IF NOT EXISTS daily_sales (
  id SERIAL PRIMARY KEY,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  table_id INTEGER,
  food_items JSONB NOT NULL,
  soda_items JSONB NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_daily_sales_table_id ON daily_sales(table_id);
CREATE INDEX IF NOT EXISTS idx_daily_sales_created_at ON daily_sales(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_sales table
CREATE POLICY "Enable read access for all users" ON daily_sales
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON daily_sales
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON daily_sales
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON daily_sales
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE daily_sales IS 'Stores individual sales transactions from quick billing and table orders';
COMMENT ON COLUMN daily_sales.sale_date IS 'Date of the sale transaction';
COMMENT ON COLUMN daily_sales.table_id IS 'Reference to table number, NULL for quick billing';
COMMENT ON COLUMN daily_sales.food_items IS 'JSON array of food items: [{"itemId": 1, "quantity": 2, "name": "...", "price": 10.50}, ...]';
COMMENT ON COLUMN daily_sales.soda_items IS 'JSON array of soda items: [{"sodaId": "uuid", "quantity": 1, "name": "...", "price": 2.50}, ...]';
COMMENT ON COLUMN daily_sales.total IS 'Total amount of the sale';