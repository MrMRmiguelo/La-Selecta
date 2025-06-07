import { supabase } from '@/integrations/supabase/client';

// Script para crear la tabla daily_totals directamente en Supabase
export const createDailyTotalsTable = async () => {
  try {
    console.log('Creando tabla daily_totals...');
    
    // SQL para crear la tabla daily_totals
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS daily_totals (
        id BIGSERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        food_items JSONB,
        soda_items JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });
    
    if (createError) {
      console.error('Error creando tabla:', createError);
      return { success: false, error: createError };
    }
    
    // Crear índice
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_daily_totals_date ON daily_totals(date);
    `;
    
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: createIndexSQL
    });
    
    if (indexError) {
      console.error('Error creando índice:', indexError);
      return { success: false, error: indexError };
    }
    
    // Habilitar RLS
    const enableRLSSQL = `
      ALTER TABLE daily_totals ENABLE ROW LEVEL SECURITY;
    `;
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: enableRLSSQL
    });
    
    if (rlsError) {
      console.error('Error habilitando RLS:', rlsError);
      return { success: false, error: rlsError };
    }
    
    // Crear políticas
    const createPoliciesSQL = `
      CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON daily_totals
        FOR SELECT USING (true);
      
      CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON daily_totals
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      
      CREATE POLICY IF NOT EXISTS "Enable update for authenticated users" ON daily_totals
        FOR UPDATE USING (auth.role() = 'authenticated');
      
      CREATE POLICY IF NOT EXISTS "Enable delete for authenticated users" ON daily_totals
        FOR DELETE USING (auth.role() = 'authenticated');
    `;
    
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: createPoliciesSQL
    });
    
    if (policiesError) {
      console.error('Error creando políticas:', policiesError);
      return { success: false, error: policiesError };
    }
    
    console.log('Tabla daily_totals creada exitosamente');
    return { success: true };
    
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error };
  }
};

// Función alternativa usando INSERT directo si no existe exec_sql
export const createDailyTotalsTableAlternative = async () => {
  try {
    console.log('Verificando si existe tabla daily_totals...');
    
    // Intentar hacer una consulta simple para ver si la tabla existe
    const { data, error } = await supabase
      .from('daily_totals')
      .select('id')
      .limit(1);
    
    if (!error) {
      console.log('La tabla daily_totals ya existe');
      return { success: true, message: 'Tabla ya existe' };
    }
    
    // Si la tabla no existe, intentar crearla usando una función personalizada
    console.log('La tabla no existe, necesita ser creada manualmente en Supabase Dashboard');
    return { 
      success: false, 
      error: 'Tabla daily_totals no existe. Debe crearse manualmente en Supabase Dashboard.',
      sqlToExecute: `
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
      `
    };
    
  } catch (error) {
    console.error('Error verificando tabla:', error);
    return { success: false, error };
  }
};