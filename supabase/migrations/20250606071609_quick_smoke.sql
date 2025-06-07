/*
  # Create subscriptions and webhook management tables

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `hotmart_transaction_id` (text, unique)
      - `status` (text - active, cancelled, overdue)
      - `plan_name` (text)
      - `amount` (decimal)
      - `currency` (text)
      - `start_date` (timestamp)
      - `end_date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `webhook_logs`
      - `id` (uuid, primary key)
      - `event_type` (text)
      - `hotmart_transaction_id` (text)
      - `payload` (jsonb)
      - `processed` (boolean)
      - `error_message` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read their own subscription data
    - Add policies for service role to manage webhook data

  3. Functions
    - Function to generate secure random passwords
    - Function to handle subscription status updates
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  hotmart_transaction_id text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'overdue', 'refunded')),
  plan_name text NOT NULL DEFAULT 'DeliveryFlow AI Monthly',
  amount decimal(10,2) NOT NULL DEFAULT 497.00,
  currency text NOT NULL DEFAULT 'BRL',
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create webhook logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  hotmart_transaction_id text,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Users can read own subscription data"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions
  FOR ALL
  TO service_role
  USING (true);

-- Policies for webhook logs (service role only)
CREATE POLICY "Service role can manage webhook logs"
  ON webhook_logs
  FOR ALL
  TO service_role
  USING (true);

-- Function to generate secure random password
CREATE OR REPLACE FUNCTION generate_secure_password()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status(
  p_transaction_id text,
  p_new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE subscriptions 
  SET 
    status = p_new_status,
    updated_at = now(),
    end_date = CASE 
      WHEN p_new_status IN ('cancelled', 'refunded') THEN now()
      ELSE end_date
    END
  WHERE hotmart_transaction_id = p_transaction_id;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_hotmart_id ON subscriptions(hotmart_transaction_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction_id ON webhook_logs(hotmart_transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed);