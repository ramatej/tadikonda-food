-- ============================================================================
-- Migration 01: Core Schema & Profile Provisioning Trigger
-- Tadikonda Food Delivery Application
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'restaurant_owner', 'delivery_partner', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. RESTAURANT PROFILES (For application review)
CREATE TABLE IF NOT EXISTS public.restaurant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  application_status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (application_status IN ('pending_approval', 'approved', 'rejected')),
  phone TEXT,
  location_area TEXT,
  full_address TEXT,
  cuisine TEXT[] DEFAULT '{}',
  tagline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_profiles_owner ON public.restaurant_profiles(owner_id);

-- 3. DELIVERY PARTNER PROFILES (For application review & online status)
CREATE TABLE IF NOT EXISTS public.delivery_partner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  approval_status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (approval_status IN ('pending_approval', 'approved', 'rejected')),
  availability_status TEXT NOT NULL DEFAULT 'offline' CHECK (availability_status IN ('online', 'offline')),
  vehicle_type TEXT,
  vehicle_number TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_partner_profiles_user ON public.delivery_partner_profiles(user_id);

-- 4. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home' CHECK (label IN ('Home', 'Work', 'Other')),
  door_no TEXT NOT NULL,
  street TEXT NOT NULL,
  landmark TEXT,
  village_area TEXT NOT NULL DEFAULT 'Main Bazar Center',
  city TEXT NOT NULL DEFAULT 'Tadikonda',
  district TEXT NOT NULL DEFAULT 'Guntur',
  state TEXT NOT NULL DEFAULT 'Andhra Pradesh',
  pincode TEXT NOT NULL DEFAULT '522236',
  phone TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

-- 5. RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  cuisine TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  review_count INT NOT NULL DEFAULT 0,
  delivery_time_minutes INT NOT NULL DEFAULT 20,
  price_for_two INT NOT NULL DEFAULT 200,
  image_url TEXT NOT NULL,
  cover_image_url TEXT,
  location_area TEXT NOT NULL,
  full_address TEXT NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending_approval', 'active', 'rejected', 'suspended')),
  phone TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_status ON public.restaurants(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON public.restaurants(location_area);

-- 6. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10,2) CHECK (original_price >= price),
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  is_veg BOOLEAN NOT NULL DEFAULT TRUE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.8,
  review_count INT NOT NULL DEFAULT 0,
  preparation_time_minutes INT NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
  delivery_partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled')),
  item_subtotal NUMERIC(10,2) NOT NULL CHECK (item_subtotal >= 0),
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 20.00,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  voucher_code TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'upi_demo')),
  payment_status TEXT NOT NULL DEFAULT 'pending',
  delivery_address JSONB NOT NULL,
  customer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_partner ON public.orders(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 8. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  is_veg BOOLEAN NOT NULL DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 9. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_order_review UNIQUE (order_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON public.reviews(restaurant_id);

-- 10. PLATFORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 20.00,
  platform_open BOOLEAN NOT NULL DEFAULT TRUE,
  free_delivery_threshold NUMERIC(10,2) NOT NULL DEFAULT 499.00,
  service_tax_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  announcement_banner TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default row for platform_settings
INSERT INTO public.platform_settings (id, delivery_fee, platform_open, free_delivery_threshold, service_tax_percentage)
VALUES ('current', 20.00, TRUE, 499.00, 0.00)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Profile Provisioning Trigger on auth.users (Section 7)
-- ============================================================================

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

  -- If restaurant owner, initialize pending application profile
  IF v_role = 'restaurant_owner' THEN
    INSERT INTO public.restaurant_profiles (owner_id, restaurant_name, application_status, phone, created_at)
    VALUES (NEW.id, v_name || '''s Kitchen', 'pending_approval', v_phone, NOW())
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
  -- Prevent user signup failures due to auxiliary triggers
  RAISE WARNING 'handle_new_user error for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
