-- Migration: Make supply_lot_id nullable in stock_movements
-- This allows stock movements without supply lots (e.g., produce/harvest movements)

USE quanlymuavu;

-- Step 1: Make the column nullable
ALTER TABLE stock_movements 
MODIFY COLUMN supply_lot_id INT NULL;

-- Step 2: Update existing data - convert 0 values to NULL
UPDATE stock_movements 
SET supply_lot_id = NULL 
WHERE supply_lot_id = 0;
