-- Create enum for kitchen types matching existing data
CREATE TYPE app_rola_menu AS ENUM ('Buffet', 'Cocina_1', 'Cocina_2');

-- Add tipo_cocina column to menu table if it doesn't exist
ALTER TABLE menu ADD COLUMN IF NOT EXISTS tipo_cocina app_rola_menu DEFAULT 'Buffet';

-- Update existing records to have a default value
UPDATE menu SET tipo_cocina = 'Buffet' WHERE tipo_cocina IS NULL;

-- Make the column NOT NULL
ALTER TABLE menu ALTER COLUMN tipo_cocina SET NOT NULL;