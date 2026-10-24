-- ============================================================================
-- Migration 04: Trusted Administrative Provisioning Procedure
-- Tadikonda Food Delivery Application
-- ============================================================================

-- Procedure to securely promote a designated user to the 'admin' role.
-- Can ONLY be executed by postgres / service-role.
-- EXECUTE privilege is explicitly revoked from anon and authenticated clients.

CREATE OR REPLACE FUNCTION public.provision_admin(target_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Look up user ID from auth.users by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = target_email;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User with given email does not exist in auth.users. They must register first.'
    );
  END IF;

  -- Assign trusted admin role in public.profiles
  UPDATE public.profiles
  SET role = 'admin', updated_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User successfully promoted to admin role',
    'user_id', v_user_id,
    'email', target_email
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.provision_admin(TEXT) FROM public, anon, authenticated;

-- HOW TO RUN PROVISIONING FOR DESIGNATED ADMIN:
-- SELECT public.provision_admin('ADMIN_EMAIL');
