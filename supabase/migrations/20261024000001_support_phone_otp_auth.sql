-- ============================================================================
-- Migration 07: Support Phone OTP Authentication & Profile Provisioning
-- Tadikonda Food Delivery Application
-- ============================================================================

-- 1. Index on profiles phone for lookup performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- 2. Enhanced handle_new_user() supporting Phone OTP sign-ins
-- In phone-only authentication (Supabase phone OTP), NEW.email is NULL and NEW.phone contains the E.164 number (+91XXXXXXXXXX).
-- This procedure safely initializes customer profiles without failing NOT NULL constraints on full_name.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_phone TEXT;
BEGIN
  -- Extract phone: prioritize auth.users phone, fallback to metadata
  v_phone := COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone');

  -- Role safety policy:
  -- Phone OTP sign-ins are exclusively customer logins.
  -- Restaurant Owner and Delivery Partner roles require dedicated onboarding and verification.
  -- Admin role CANNOT be assigned through client metadata.
  IF NEW.phone IS NOT NULL AND (NEW.email IS NULL OR NEW.email = '') THEN
    v_role := 'customer';
  ELSE
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
    IF v_role NOT IN ('customer', 'restaurant_owner', 'delivery_partner') THEN
      v_role := 'customer';
    END IF;
  END IF;

  -- Fallback name logic:
  -- If full_name is provided in metadata, use it.
  -- Otherwise, if email exists, use local part.
  -- Otherwise, use friendly 'Customer ' + last 4 digits of phone.
  v_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(split_part(NEW.email, '@', 1), ''),
    'Customer ' || RIGHT(COALESCE(v_phone, 'User'), 4)
  );

  -- Upsert profile in public.profiles
  INSERT INTO public.profiles (id, full_name, role, phone, created_at, updated_at)
  VALUES (NEW.id, v_name, v_role, v_phone, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
  SET full_name = CASE 
        WHEN public.profiles.full_name LIKE 'Customer %' AND EXCLUDED.full_name NOT LIKE 'Customer %' 
        THEN EXCLUDED.full_name 
        ELSE public.profiles.full_name 
      END,
      phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
      updated_at = NOW();

  -- If registered as restaurant owner via email onboarding, initialize pending application
  IF v_role = 'restaurant_owner' THEN
    INSERT INTO public.restaurant_profiles (owner_id, restaurant_name, application_status, phone, created_at)
    VALUES (NEW.id, v_name || '''s Kitchen', 'pending_approval', v_phone, NOW())
    ON CONFLICT DO NOTHING;

    INSERT INTO public.restaurants (
      owner_id, name, tagline, cuisine, location_area, full_address, phone, is_open, status, image_url, price_for_two, delivery_time_minutes
    )
    VALUES (
      NEW.id,
      v_name || '''s Kitchen',
      'Authentic Tadikonda Flavors',
      ARRAY['South Indian', 'Tiffins'],
      'Main Bazar Center',
      'Tadikonda - 522236',
      COALESCE(v_phone, '+91 90000 00000'),
      FALSE,
      'pending_approval',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      180,
      20
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- If registered as delivery partner via email onboarding, initialize pending delivery partner profile
  IF v_role = 'delivery_partner' THEN
    INSERT INTO public.delivery_partner_profiles (user_id, approval_status, availability_status, phone, created_at)
    VALUES (NEW.id, 'pending_approval', 'offline', v_phone, NOW())
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;
