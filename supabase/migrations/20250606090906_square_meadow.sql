/*
  # Create conversations table for AI agent

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `customer_phone` (text)
      - `customer_name` (text)
      - `platform` (text - whatsapp, instagram)
      - `message_type` (text - text, audio, image)
      - `customer_message` (text)
      - `ai_response` (text)
      - `conversation_id` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on conversations table
    - Add policies for authenticated users to read their own conversations
    - Add policies for service role to manage all conversations
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_phone text NOT NULL,
  customer_name text,
  platform text NOT NULL CHECK (platform IN ('whatsapp', 'instagram')),
  message_type text NOT NULL CHECK (message_type IN ('text', 'audio', 'image')),
  customer_message text NOT NULL,
  ai_response text NOT NULL,
  conversation_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can read own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all conversations"
  ON conversations
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_restaurant_id ON conversations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_phone ON conversations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_conversations_conversation_id ON conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_platform ON conversations(platform);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);