import { supabase } from '@/integrations/supabase/client';

type DatabaseSetupResult = {
  success: boolean;
  error: any;
  sqlToExecute?: string;
};

type SetupDatabaseResults = {
  daily_sales: DatabaseSetupResult;
  daily_totals: DatabaseSetupResult;
};

// Script para crear las tablas faltantes directamente en Supabase
export const setupDatabase = async (): Promise<SetupDatabaseResults> => {
  const results: SetupDatabaseResults = {
    daily_sales: { success: false, error: null },
    daily_totals: { success: false, error: null }
  };

  try {
    console.log('Configurando base de datos...');
    
    // 1. Crear tabla daily_sales
    console.log('Creando tabla daily_sales...');
    
    const createDailySalesSQL = `
      CREATE TABLE IF NOT EXISTS daily_sales (
        id SERIAL PRIMARY KEY,
        sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
        table_id INTEGER,
        food_items JSONB NOT NULL,
        soda_items JSONB NOT NULL,
        total NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales(sale_date);
      CREATE INDEX IF NOT EXISTS idx_daily_sales_table_id ON daily_sales(table_id);
      CREATE INDEX IF NOT EXISTS idx_daily_sales_created_at ON daily_sales(created_at);
      
      ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON daily_sales
        FOR SELECT USING (true);
      
      CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON daily_sales
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      
      CREATE POLICY IF NOT EXISTS "Enable update for authenticated users" ON daily_sales
        FOR UPDATE USING (auth.role() = 'authenticated');
      
      CREATE POLICY IF NOT EXISTS "Enable delete for authenticated users" ON daily_sales
        FOR DELETE USING (auth.role() = 'authenticated');
    `;
    
    // Intentar crear daily_sales usando una consulta directa
    try {
      // Verificar si la tabla existe
      const { data: existingDailySales, error: checkError } = await supabase
        .from('daily_sales')
        .select('id')
        .limit(1);
      
      if (checkError && checkError.message?.includes('does not exist')) {
        console.log('Tabla daily_sales no existe, necesita ser creada manualmente');
        results.daily_sales = {
          success: false,
          error: 'Tabla daily_sales no existe. Debe crearse manualmente en Supabase Dashboard.',
          sqlToExecute: createDailySalesSQL
        };
      } else {
        console.log('Tabla daily_sales ya existe');
        results.daily_sales = { success: true, error: null };
      }
    } catch (error) {
      results.daily_sales = { success: false, error, sqlToExecute: createDailySalesSQL };
    }
    
    // 2. Crear tabla daily_totals
    console.log('Creando tabla daily_totals...');
    
    const createDailyTotalsSQL = `
      CREATE TABLE IF NOT EXISTS daily_totals (
        id BIGSERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        food_items JSONB,
        soda_items JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_daily_totals_date ON daily_totals(date);
      
      ALTER TABLE daily_totals ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON daily_totals
        FOR SELECT USING (true);
      
      CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON daily_totals
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      
      CREATE POLICY IF NOT EXISTS "Enable update for authenticated users" ON daily_totals
        FOR UPDATE USING (auth.role() = 'authenticated');
      
      CREATE POLICY IF NOT EXISTS "Enable delete for authenticated users" ON daily_totals
        FOR DELETE USING (auth.role() = 'authenticated');
    `;
    
    try {
      // Verificar si la tabla existe
      const { data: existingDailyTotals, error: checkError } = await supabase
        .from('daily_totals')
        .select('id')
        .limit(1);
      
      if (checkError && checkError.message?.includes('does not exist')) {
        console.log('Tabla daily_totals no existe, necesita ser creada manualmente');
        results.daily_totals = {
          success: false,
          error: 'Tabla daily_totals no existe. Debe crearse manualmente en Supabase Dashboard.',
          sqlToExecute: createDailyTotalsSQL
        };
      } else {
        console.log('Tabla daily_totals ya existe');
        results.daily_totals = { success: true, error: null };
      }
    } catch (error) {
      results.daily_totals = { success: false, error, sqlToExecute: createDailyTotalsSQL };
    }
    
    return results;
    
  } catch (error) {
    console.error('Error inesperado configurando base de datos:', error);
    return {
      daily_sales: { success: false, error },
      daily_totals: { success: false, error }
    };
  }
};

// Función para mostrar las instrucciones SQL que deben ejecutarse manualmente
export const getDatabaseSetupInstructions = () => {
  return {
    title: 'Instrucciones para configurar la base de datos',
    description: 'Ejecuta los siguientes comandos SQL en tu dashboard de Supabase:',
    daily_sales_sql: `
-- Crear tabla daily_sales
CREATE TABLE IF NOT EXISTS daily_sales (
  id SERIAL PRIMARY KEY,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  table_id INTEGER,
  food_items JSONB NOT NULL,
  soda_items JSONB NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_daily_sales_table_id ON daily_sales(table_id);
CREATE INDEX IF NOT EXISTS idx_daily_sales_created_at ON daily_sales(created_at);

ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON daily_sales
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON daily_sales
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON daily_sales
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON daily_sales
  FOR DELETE USING (auth.role() = 'authenticated');
    `,
    daily_totals_sql: `
-- Crear tabla daily_totals
CREATE TABLE IF NOT EXISTS daily_totals (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  food_items JSONB,
  soda_items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_totals_date ON daily_totals(date);

ALTER TABLE daily_totals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON daily_totals
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON daily_totals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON daily_totals
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON daily_totals
  FOR DELETE USING (auth.role() = 'authenticated');

-- Función para actualizar daily_totals automáticamente
CREATE OR REPLACE FUNCTION update_daily_totals()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO daily_totals (date, total, food_items, soda_items)
    SELECT 
        sale_date,
        SUM(total),
        jsonb_agg(DISTINCT food_items) FILTER (WHERE food_items IS NOT NULL),
        jsonb_agg(DISTINCT soda_items) FILTER (WHERE soda_items IS NOT NULL)
    FROM daily_sales 
    WHERE sale_date = COALESCE(NEW.sale_date, OLD.sale_date)
    GROUP BY sale_date
    ON CONFLICT (date) 
    DO UPDATE SET 
        total = EXCLUDED.total,
        food_items = EXCLUDED.food_items,
        soda_items = EXCLUDED.soda_items,
        updated_at = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar daily_totals automáticamente
CREATE TRIGGER trigger_update_daily_totals
    AFTER INSERT OR UPDATE OR DELETE ON daily_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_totals();
    `
  };
};