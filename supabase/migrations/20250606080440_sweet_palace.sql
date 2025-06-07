/*
  # Create onboarding and restaurant management tables

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `phone` (text)
      - `email` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `description` (text)
      - `logo_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `category` (text)
      - `image_url` (text)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `delivery_zones`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `neighborhood` (text)
      - `delivery_fee` (decimal)
      - `delivery_time_min` (integer)
      - `delivery_time_max` (integer)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_onboarding_status`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `restaurant_completed` (boolean)
      - `products_completed` (boolean)
      - `delivery_zones_completed` (boolean)
      - `onboarding_completed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  description text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  image_url text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create delivery zones table
CREATE TABLE IF NOT EXISTS delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  neighborhood text NOT NULL,
  delivery_fee decimal(10,2) NOT NULL DEFAULT 0.00,
  delivery_time_min integer NOT NULL DEFAULT 30,
  delivery_time_max integer NOT NULL DEFAULT 60,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user onboarding status table
CREATE TABLE IF NOT EXISTS user_onboarding_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  restaurant_completed boolean DEFAULT false,
  products_completed boolean DEFAULT false,
  delivery_zones_completed boolean DEFAULT false,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_status ENABLE ROW LEVEL SECURITY;

-- Policies for restaurants
CREATE POLICY "Users can manage own restaurant"
  ON restaurants
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for products
CREATE POLICY "Users can manage own products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Policies for delivery zones
CREATE POLICY "Users can manage own delivery zones"
  ON delivery_zones
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Policies for onboarding status
CREATE POLICY "Users can manage own onboarding status"
  ON user_onboarding_status
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON restaurants(user_id);
CREATE INDEX IF NOT EXISTS idx_products_restaurant_id ON products(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_restaurant_id ON delivery_zones(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status_user_id ON user_onboarding_status(user_id);

-- Function to update onboarding status
CREATE OR REPLACE FUNCTION update_onboarding_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_var uuid;
  restaurant_exists boolean;
  has_products boolean;
  has_delivery_zones boolean;
BEGIN
  -- Get user_id based on the table being updated
  IF TG_TABLE_NAME = 'restaurants' THEN
    user_id_var := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'products' THEN
    SELECT user_id INTO user_id_var FROM restaurants WHERE id = NEW.restaurant_id;
  ELSIF TG_TABLE_NAME = 'delivery_zones' THEN
    SELECT user_id INTO user_id_var FROM restaurants WHERE id = NEW.restaurant_id;
  END IF;

  -- Check completion status
  SELECT EXISTS(SELECT 1 FROM restaurants WHERE user_id = user_id_var) INTO restaurant_exists;
  SELECT EXISTS(
    SELECT 1 FROM products p 
    JOIN restaurants r ON p.restaurant_id = r.id 
    WHERE r.user_id = user_id_var
  ) INTO has_products;
  SELECT EXISTS(
    SELECT 1 FROM delivery_zones dz 
    JOIN restaurants r ON dz.restaurant_id = r.id 
    WHERE r.user_id = user_id_var
  ) INTO has_delivery_zones;

  -- Insert or update onboarding status
  INSERT INTO user_onboarding_status (
    user_id,
    restaurant_completed,
    products_completed,
    delivery_zones_completed,
    onboarding_completed,
    updated_at
  ) VALUES (
    user_id_var,
    restaurant_exists,
    has_products,
    has_delivery_zones,
    restaurant_exists AND has_products AND has_delivery_zones,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    restaurant_completed = restaurant_exists,
    products_completed = has_products,
    delivery_zones_completed = has_delivery_zones,
    onboarding_completed = restaurant_exists AND has_products AND has_delivery_zones,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Create triggers to update onboarding status
CREATE OR REPLACE TRIGGER update_onboarding_on_restaurant_change
  AFTER INSERT OR UPDATE OR DELETE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_onboarding_status();

CREATE OR REPLACE TRIGGER update_onboarding_on_product_change
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION update_onboarding_status();

CREATE OR REPLACE TRIGGER update_onboarding_on_delivery_zone_change
  AFTER INSERT OR UPDATE OR DELETE ON delivery_zones
  FOR EACH ROW EXECUTE FUNCTION update_onboarding_status();