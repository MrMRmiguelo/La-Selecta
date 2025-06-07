-- Create daily_totals table to store aggregated daily sales data
CREATE TABLE IF NOT EXISTS daily_totals (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    food_items JSONB,
    soda_items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_daily_totals_date ON daily_totals(date);

-- Enable RLS (Row Level Security)
ALTER TABLE daily_totals ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_totals table
CREATE POLICY "Enable read access for all users" ON daily_totals
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON daily_totals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON daily_totals
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON daily_totals
    FOR DELETE USING (auth.role() = 'authenticated');

-- Function to update daily totals when daily_sales is inserted/updated
CREATE OR REPLACE FUNCTION update_daily_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update daily totals
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

-- Create trigger to automatically update daily_totals
CREATE TRIGGER trigger_update_daily_totals
    AFTER INSERT OR UPDATE OR DELETE ON daily_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_totals();