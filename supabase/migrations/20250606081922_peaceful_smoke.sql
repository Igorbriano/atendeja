/*
  # Add external menu URL to restaurants table

  1. Changes
    - Add `external_menu_url` column to restaurants table
    - This will allow restaurants to link to external digital menus

  2. Security
    - No additional RLS policies needed as restaurants table already has proper policies
*/

-- Add external menu URL column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS external_menu_url text;