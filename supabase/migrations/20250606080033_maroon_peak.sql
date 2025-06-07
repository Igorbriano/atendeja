/*
  # Criar usuário teste com assinatura ativa

  1. Criar usuário teste no auth.users
  2. Criar assinatura ativa para o usuário
  
  Este script verifica se o usuário já existe antes de criar.
*/

-- Primeiro, vamos verificar e criar o usuário se não existir
DO $$
DECLARE
  user_id_var uuid;
  user_exists boolean;
BEGIN
  -- Verificar se o usuário já existe
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'brianoigor@gmail.com') INTO user_exists;
  
  IF NOT user_exists THEN
    -- Criar novo usuário
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'brianoigor@gmail.com',
      crypt('Igor@1234', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Igor Brian", "restaurant_name": "Restaurante Teste"}',
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    );
  ELSE
    -- Atualizar usuário existente
    UPDATE auth.users SET
      encrypted_password = crypt('Igor@1234', gen_salt('bf')),
      email_confirmed_at = now(),
      updated_at = now(),
      raw_user_meta_data = '{"name": "Igor Brian", "restaurant_name": "Restaurante Teste"}'
    WHERE email = 'brianoigor@gmail.com';
  END IF;
  
  -- Obter o ID do usuário
  SELECT id INTO user_id_var FROM auth.users WHERE email = 'brianoigor@gmail.com';
  
  -- Verificar se já existe uma assinatura para este usuário
  IF NOT EXISTS(SELECT 1 FROM subscriptions WHERE user_id = user_id_var) THEN
    -- Criar assinatura ativa
    INSERT INTO subscriptions (
      user_id,
      hotmart_transaction_id,
      status,
      plan_name,
      amount,
      currency,
      start_date,
      created_at,
      updated_at
    ) VALUES (
      user_id_var,
      'TEST_TRANSACTION_IGOR_' || extract(epoch from now())::text,
      'active',
      'DeliveryFlow AI Monthly',
      497.00,
      'BRL',
      now(),
      now(),
      now()
    );
  ELSE
    -- Atualizar assinatura existente para ativa
    UPDATE subscriptions SET
      status = 'active',
      updated_at = now()
    WHERE user_id = user_id_var;
  END IF;
  
END $$;