-- ============================================================================
-- Migration 05: Authentication Hardening, Real Admins, and Restaurant Approval Fix
-- Tadikonda Food Delivery Application
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Status consistency & audit columns on restaurants
ALTER TABLE public.restaurants 
  DROP CONSTRAINT IF EXISTS restaurants_status_check;

ALTER TABLE public.restaurants 
  ADD CONSTRAINT restaurants_status_check 
  CHECK (status IN ('pending_approval', 'approved', 'active', 'rejected', 'suspended'));

ALTER TABLE public.restaurants 
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Status consistency & audit columns on restaurant_profiles
ALTER TABLE public.restaurant_profiles 
  DROP CONSTRAINT IF EXISTS restaurant_profiles_application_status_check;

ALTER TABLE public.restaurant_profiles 
  ADD CONSTRAINT restaurant_profiles_application_status_check 
  CHECK (application_status IN ('pending_approval', 'approved', 'active', 'rejected', 'suspended'));

ALTER TABLE public.restaurant_profiles 
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Enhance handle_new_user() to create both restaurant_profiles and restaurants entry
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
  -- Extract role from metadata, strictly validating against public roles
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  
  -- Public registration is restricted to customer, restaurant_owner, delivery_partner.
  -- Admin role CANNOT be assigned through client-provided metadata.
  IF v_role NOT IN ('customer', 'restaurant_owner', 'delivery_partner') THEN
    v_role := 'customer';
  END IF;

  v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_phone := NEW.raw_user_meta_data->>'phone';

  -- Upsert profile
  INSERT INTO public.profiles (id, full_name, role, phone, created_at, updated_at)
  VALUES (NEW.id, v_name, v_role, v_phone, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
      updated_at = NOW();

  -- If restaurant owner, initialize pending application profile AND pending restaurant
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

  -- If delivery partner, initialize pending delivery partner profile
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

-- 4. Secure procedure to approve or reject restaurant
CREATE OR REPLACE FUNCTION public.approve_restaurant(
  p_restaurant_id UUID,
  p_action TEXT, -- 'approved', 'rejected', or 'active'
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_restaurant RECORD;
  v_admin_id UUID;
BEGIN
  -- 1. Verify caller is authenticated admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only platform administrators can approve or reject restaurants';
  END IF;

  v_admin_id := auth.uid();

  -- 2. Validate action
  IF p_action NOT IN ('approved', 'rejected', 'active') THEN
    RAISE EXCEPTION 'Invalid action: must be approved, rejected, or active';
  END IF;

  -- 3. Find restaurant
  SELECT * INTO v_restaurant FROM public.restaurants WHERE id = p_restaurant_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Restaurant with ID % not found', p_restaurant_id;
  END IF;

  -- 4. Update restaurant record
  UPDATE public.restaurants
  SET 
    status = p_action,
    approved_at = CASE WHEN p_action IN ('approved', 'active') THEN NOW() ELSE NULL END,
    approved_by = CASE WHEN p_action IN ('approved', 'active') THEN v_admin_id ELSE NULL END,
    rejection_reason = CASE WHEN p_action = 'rejected' THEN p_reason ELSE NULL END,
    updated_at = NOW()
  WHERE id = p_restaurant_id;

  -- 5. If there is a matching restaurant_profiles, update it too
  IF v_restaurant.owner_id IS NOT NULL THEN
    UPDATE public.restaurant_profiles
    SET
      application_status = p_action,
      approved_at = CASE WHEN p_action IN ('approved', 'active') THEN NOW() ELSE NULL END,
      approved_by = CASE WHEN p_action IN ('approved', 'active') THEN v_admin_id ELSE NULL END,
      rejection_reason = CASE WHEN p_action = 'rejected' THEN p_reason ELSE NULL END,
      updated_at = NOW()
    WHERE owner_id = v_restaurant.owner_id;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'restaurant_id', p_restaurant_id,
    'status', p_action,
    'approved_at', NOW(),
    'approved_by', v_admin_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_restaurant(UUID, TEXT, TEXT) TO authenticated;

-- 5. Triggers to protect status modification by non-admins
CREATE OR REPLACE FUNCTION public.protect_restaurant_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.status IS DISTINCT FROM OLD.status OR 
      NEW.approved_at IS DISTINCT FROM OLD.approved_at OR 
      NEW.approved_by IS DISTINCT FROM OLD.approved_by) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only platform administrators can modify restaurant approval status or audit fields';
  END IF;

  IF NEW.is_open = TRUE AND NEW.status NOT IN ('approved', 'active') AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Restaurant cannot be opened while in % status', NEW.status;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_protect_restaurant_status'
  ) THEN
    CREATE TRIGGER trg_protect_restaurant_status
      BEFORE UPDATE ON public.restaurants
      FOR EACH ROW
      EXECUTE FUNCTION public.protect_restaurant_status();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.protect_restaurant_profile_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.application_status IS DISTINCT FROM OLD.application_status AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only platform administrators can modify restaurant profile approval status';
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_protect_restaurant_profile_status'
  ) THEN
    CREATE TRIGGER trg_protect_restaurant_profile_status
      BEFORE UPDATE ON public.restaurant_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.protect_restaurant_profile_status();
  END IF;
END $$;

-- 6. Updated RLS policies for restaurants and menu_items
ALTER POLICY "restaurants_select_public_or_owner" ON public.restaurants 
  USING (status IN ('active', 'approved') OR owner_id = auth.uid() OR public.is_admin());

ALTER POLICY "restaurants_insert_owner_or_admin" ON public.restaurants 
  WITH CHECK (
    public.is_admin() OR 
    (auth.uid() IS NOT NULL AND owner_id = auth.uid() AND status = 'pending_approval')
  );

ALTER POLICY "restaurants_update_owner_or_admin" ON public.restaurants 
  USING (public.is_admin() OR owner_id = auth.uid());

ALTER POLICY "menu_items_select_public" ON public.menu_items 
  USING (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM public.restaurants 
      WHERE restaurants.id = menu_items.restaurant_id 
        AND (restaurants.status IN ('active', 'approved') OR restaurants.owner_id = auth.uid())
    )
  );
