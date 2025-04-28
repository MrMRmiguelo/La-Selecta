-- Tabla para registrar ventas diarias con detalle de alimentos y bebidas
CREATE TABLE IF NOT EXISTS daily_sales (
  id SERIAL PRIMARY KEY,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  table_id INTEGER,
  food_items JSONB NOT NULL,
  soda_items JSONB NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ejemplo de food_items: [{"itemId": 1, "quantity": 2}, ...]
-- Ejemplo de soda_items: [{"sodaId": "uuid", "quantity": 1}, ...]