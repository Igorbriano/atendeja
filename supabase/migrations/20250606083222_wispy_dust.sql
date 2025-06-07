/*
  # Reset test user to new state

  1. Remove all related data for the test user
    - Delete restaurant data
    - Delete products
    - Delete delivery zones
    - Delete onboarding status
    - Keep subscription active but reset user to "new" state

  2. This will force the user through the complete onboarding flow
*/

DO $$
DECLARE
  user_id_var uuid;
  restaurant_id_var uuid;
BEGIN
  -- Get the test user ID
  SELECT id INTO user_id_var FROM auth.users WHERE email = 'brianoigor@gmail.com';
  
  IF user_id_var IS NOT NULL THEN
    -- Get restaurant ID if exists
    SELECT id INTO restaurant_id_var FROM restaurants WHERE user_id = user_id_var;
    
    -- Delete delivery zones first (due to foreign key constraints)
    IF restaurant_id_var IS NOT NULL THEN
      DELETE FROM delivery_zones WHERE restaurant_id = restaurant_id_var;
      DELETE FROM products WHERE restaurant_id = restaurant_id_var;
    END IF;
    
    -- Delete restaurant
    DELETE FROM restaurants WHERE user_id = user_id_var;
    
    -- Delete onboarding status
    DELETE FROM user_onboarding_status WHERE user_id = user_id_var;
    
    -- Update user metadata to remove restaurant info
    UPDATE auth.users SET
      raw_user_meta_data = '{"name": "Igor Brian"}',
      updated_at = now()
    WHERE id = user_id_var;
    
    RAISE NOTICE 'Test user reset successfully. User will go through onboarding flow.';
  ELSE
    RAISE NOTICE 'Test user not found.';
  END IF;
END $$;