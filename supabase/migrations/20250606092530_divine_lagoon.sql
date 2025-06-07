/*
  # Create marketing and pixel tracking tables

  1. New Tables
    - `marketing_pixels`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `facebook_pixel_id` (text)
      - `google_analytics_id` (text)
      - `google_ads_conversion_id` (text)
      - `google_ads_conversion_label` (text)
      - `tiktok_pixel_id` (text)
      - `taboola_pixel_id` (text)
      - `custom_scripts` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `conversion_events`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `event_type` (text)
      - `pixel_type` (text)
      - `order_value` (decimal)
      - `customer_phone` (text)
      - `order_id` (uuid, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Add policies for service role to manage conversion events
*/

-- Create marketing_pixels table
CREATE TABLE IF NOT EXISTS marketing_pixels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE UNIQUE,
  facebook_pixel_id text,
  google_analytics_id text,
  google_ads_conversion_id text,
  google_ads_conversion_label text,
  tiktok_pixel_id text,
  taboola_pixel_id text,
  custom_scripts text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversion_events table
CREATE TABLE IF NOT EXISTS conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  pixel_type text NOT NULL,
  order_value decimal(10,2) NOT NULL,
  customer_phone text NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE marketing_pixels ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

-- Policies for marketing_pixels
CREATE POLICY "Users can manage own marketing pixels"
  ON marketing_pixels
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Policies for conversion_events
CREATE POLICY "Users can read own conversion events"
  ON conversion_events
  FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all conversion events"
  ON conversion_events
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketing_pixels_restaurant_id ON marketing_pixels(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_restaurant_id ON conversion_events(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_order_id ON conversion_events(order_id);

-- Function to send conversion event when order is completed
CREATE OR REPLACE FUNCTION send_conversion_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_restaurant_id uuid;
BEGIN
  -- Only trigger on status change to 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    v_restaurant_id := NEW.restaurant_id;
    
    -- Insert conversion event
    INSERT INTO conversion_events (
      restaurant_id,
      event_type,
      pixel_type,
      order_value,
      customer_phone,
      order_id
    ) VALUES (
      v_restaurant_id,
      'purchase',
      'auto',
      NEW.total_amount,
      NEW.customer_phone,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic conversion tracking
CREATE OR REPLACE TRIGGER trigger_conversion_event
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION send_conversion_event();