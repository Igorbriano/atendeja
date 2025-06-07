/*
  # Adicionar planos de assinatura e limites

  1. Alterações na tabela subscriptions
    - Adicionar coluna plan_type para identificar o plano
    - Adicionar colunas de limites mensais
    - Adicionar coluna de uso atual

  2. Nova tabela subscription_usage
    - Rastrear uso mensal por usuário
    - Reset automático todo mês

  3. Funções para verificar limites
    - Função para verificar se usuário pode usar funcionalidade
    - Função para incrementar uso
*/

-- Adicionar colunas de plano à tabela subscriptions
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'profissional' 
CHECK (plan_type IN ('essencial', 'profissional', 'ilimitado'));

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS monthly_ai_limit integer DEFAULT 400;

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS monthly_messages_limit integer DEFAULT 300;

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS monthly_images_limit integer DEFAULT 50;

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '{"text_messages": true, "audio_messages": false, "image_messages": false, "reactivation": false, "analytics": "basic"}'::jsonb;

-- Criar tabela de uso mensal
CREATE TABLE IF NOT EXISTS subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year text NOT NULL, -- formato: "2024-01"
  ai_interactions_used integer DEFAULT 0,
  messages_sent integer DEFAULT 0,
  images_uploaded integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_usage
CREATE POLICY "Users can read own usage"
  ON subscription_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all usage"
  ON subscription_usage
  FOR ALL
  TO service_role
  USING (true);

-- Função para verificar limites do usuário
CREATE OR REPLACE FUNCTION check_user_limit(
  p_user_id uuid,
  p_limit_type text,
  p_increment integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription subscriptions%ROWTYPE;
  v_usage subscription_usage%ROWTYPE;
  v_current_month text;
  v_current_usage integer;
  v_limit integer;
  v_can_use boolean;
BEGIN
  -- Get current month
  v_current_month := to_char(now(), 'YYYY-MM');
  
  -- Get user subscription
  SELECT * INTO v_subscription
  FROM subscriptions 
  WHERE user_id = p_user_id AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_use', false,
      'reason', 'no_active_subscription',
      'current_usage', 0,
      'limit', 0
    );
  END IF;
  
  -- For unlimited plan, always allow
  IF v_subscription.plan_type = 'ilimitado' THEN
    RETURN jsonb_build_object(
      'can_use', true,
      'reason', 'unlimited_plan',
      'current_usage', 0,
      'limit', -1
    );
  END IF;
  
  -- Get or create usage record
  INSERT INTO subscription_usage (user_id, month_year)
  VALUES (p_user_id, v_current_month)
  ON CONFLICT (user_id, month_year) DO NOTHING;
  
  SELECT * INTO v_usage
  FROM subscription_usage
  WHERE user_id = p_user_id AND month_year = v_current_month;
  
  -- Check specific limit type
  CASE p_limit_type
    WHEN 'ai_interactions' THEN
      v_current_usage := v_usage.ai_interactions_used;
      v_limit := v_subscription.monthly_ai_limit;
    WHEN 'messages' THEN
      v_current_usage := v_usage.messages_sent;
      v_limit := v_subscription.monthly_messages_limit;
    WHEN 'images' THEN
      v_current_usage := v_usage.images_uploaded;
      v_limit := v_subscription.monthly_images_limit;
    ELSE
      RETURN jsonb_build_object(
        'can_use', false,
        'reason', 'invalid_limit_type',
        'current_usage', 0,
        'limit', 0
      );
  END CASE;
  
  v_can_use := (v_current_usage + p_increment) <= v_limit;
  
  RETURN jsonb_build_object(
    'can_use', v_can_use,
    'reason', CASE WHEN v_can_use THEN 'within_limit' ELSE 'limit_exceeded' END,
    'current_usage', v_current_usage,
    'limit', v_limit,
    'plan_type', v_subscription.plan_type
  );
END;
$$;

-- Função para incrementar uso
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id uuid,
  p_limit_type text,
  p_amount integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_month text;
  v_check_result jsonb;
BEGIN
  -- Check if user can use this feature
  v_check_result := check_user_limit(p_user_id, p_limit_type, p_amount);
  
  IF NOT (v_check_result->>'can_use')::boolean THEN
    RETURN false;
  END IF;
  
  -- Get current month
  v_current_month := to_char(now(), 'YYYY-MM');
  
  -- Increment usage
  CASE p_limit_type
    WHEN 'ai_interactions' THEN
      UPDATE subscription_usage 
      SET ai_interactions_used = ai_interactions_used + p_amount,
          updated_at = now()
      WHERE user_id = p_user_id AND month_year = v_current_month;
    WHEN 'messages' THEN
      UPDATE subscription_usage 
      SET messages_sent = messages_sent + p_amount,
          updated_at = now()
      WHERE user_id = p_user_id AND month_year = v_current_month;
    WHEN 'images' THEN
      UPDATE subscription_usage 
      SET images_uploaded = images_uploaded + p_amount,
          updated_at = now()
      WHERE user_id = p_user_id AND month_year = v_current_month;
  END CASE;
  
  RETURN true;
END;
$$;

-- Atualizar assinatura do usuário teste para plano profissional
UPDATE subscriptions 
SET 
  plan_type = 'profissional',
  monthly_ai_limit = 400,
  monthly_messages_limit = 300,
  monthly_images_limit = 50,
  features = '{"text_messages": true, "audio_messages": true, "image_messages": true, "reactivation": true, "analytics": "complete"}'::jsonb
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'brianoigor@gmail.com');

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_month ON subscription_usage(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON subscriptions(plan_type);