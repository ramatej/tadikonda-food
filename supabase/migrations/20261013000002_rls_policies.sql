-- ============================================================================
-- Migration 02: Row Level Security (RLS) Policies & Authorization
-- Tadikonda Food Delivery Application
-- ============================================================================

-- Security Definer Role Lookup Helpers (prevents recursive RLS evaluation)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- Prevent role elevation by non-admins
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role <> OLD.role AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- ============================================================================
-- Enable RLS on all exposed tables
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- ----------------------------------------------------------------------------
-- RESTAURANT PROFILES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "restaurant_profiles_select" ON public.restaurant_profiles;
CREATE POLICY "restaurant_profiles_select" ON public.restaurant_profiles
  FOR SELECT USING (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "restaurant_profiles_insert" ON public.restaurant_profiles;
CREATE POLICY "restaurant_profiles_insert" ON public.restaurant_profiles
  FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "restaurant_profiles_update" ON public.restaurant_profiles;
CREATE POLICY "restaurant_profiles_update" ON public.restaurant_profiles
  FOR UPDATE USING (owner_id = auth.uid() OR public.is_admin())
  WITH CHECK (
    public.is_admin() OR 
    (owner_id = auth.uid() AND application_status = 'pending_approval')
  );

-- ----------------------------------------------------------------------------
-- DELIVERY PARTNER PROFILES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "delivery_profiles_select" ON public.delivery_partner_profiles;
CREATE POLICY "delivery_profiles_select" ON public.delivery_partner_profiles
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "delivery_profiles_insert" ON public.delivery_partner_profiles;
CREATE POLICY "delivery_profiles_insert" ON public.delivery_partner_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "delivery_profiles_update" ON public.delivery_partner_profiles;
CREATE POLICY "delivery_profiles_update" ON public.delivery_partner_profiles
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- ----------------------------------------------------------------------------
-- ADDRESSES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "addresses_all_own" ON public.addresses;
CREATE POLICY "addresses_all_own" ON public.addresses
  FOR ALL USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ----------------------------------------------------------------------------
-- RESTAURANTS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "restaurants_select_public_or_owner" ON public.restaurants;
CREATE POLICY "restaurants_select_public_or_owner" ON public.restaurants
  FOR SELECT USING (status = 'active' OR owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "restaurants_insert_owner_or_admin" ON public.restaurants;
CREATE POLICY "restaurants_insert_owner_or_admin" ON public.restaurants
  FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "restaurants_update_owner_or_admin" ON public.restaurants;
CREATE POLICY "restaurants_update_owner_or_admin" ON public.restaurants
  FOR UPDATE USING ((owner_id = auth.uid() AND status = 'active') OR public.is_admin());

DROP POLICY IF EXISTS "restaurants_delete_admin" ON public.restaurants;
CREATE POLICY "restaurants_delete_admin" ON public.restaurants
  FOR DELETE USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- MENU ITEMS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "menu_items_select_public" ON public.menu_items;
CREATE POLICY "menu_items_select_public" ON public.menu_items
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "menu_items_insert_owner" ON public.menu_items;
CREATE POLICY "menu_items_insert_owner" ON public.menu_items
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.restaurants WHERE id = menu_items.restaurant_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "menu_items_update_owner" ON public.menu_items;
CREATE POLICY "menu_items_update_owner" ON public.menu_items
  FOR UPDATE USING (
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.restaurants WHERE id = menu_items.restaurant_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "menu_items_delete_owner" ON public.menu_items;
CREATE POLICY "menu_items_delete_owner" ON public.menu_items
  FOR DELETE USING (
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.restaurants WHERE id = menu_items.restaurant_id AND owner_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- ORDERS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "orders_select_participants" ON public.orders;
CREATE POLICY "orders_select_participants" ON public.orders
  FOR SELECT USING (
    customer_id = auth.uid() OR
    delivery_partner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.restaurants WHERE id = orders.restaurant_id AND owner_id = auth.uid()) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "orders_insert_customer" ON public.orders;
CREATE POLICY "orders_insert_customer" ON public.orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "orders_update_participants" ON public.orders;
CREATE POLICY "orders_update_participants" ON public.orders
  FOR UPDATE USING (
    customer_id = auth.uid() OR
    delivery_partner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.restaurants WHERE id = orders.restaurant_id AND owner_id = auth.uid()) OR
    public.is_admin()
  );

-- ----------------------------------------------------------------------------
-- ORDER ITEMS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "order_items_select_participants" ON public.order_items;
CREATE POLICY "order_items_select_participants" ON public.order_items
  FOR SELECT USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (
          orders.customer_id = auth.uid() OR
          orders.delivery_partner_id = auth.uid() OR
          EXISTS (SELECT 1 FROM public.restaurants WHERE id = orders.restaurant_id AND owner_id = auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "order_items_insert_customer" ON public.order_items;
CREATE POLICY "order_items_insert_customer" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND customer_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- REVIEWS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
CREATE POLICY "reviews_select_public" ON public.reviews
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "reviews_insert_customer" ON public.reviews;
CREATE POLICY "reviews_insert_customer" ON public.reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "reviews_modify_admin" ON public.reviews;
CREATE POLICY "reviews_modify_admin" ON public.reviews
  FOR ALL USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- PLATFORM SETTINGS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "platform_settings_select_public" ON public.platform_settings;
CREATE POLICY "platform_settings_select_public" ON public.platform_settings
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "platform_settings_modify_admin" ON public.platform_settings;
CREATE POLICY "platform_settings_modify_admin" ON public.platform_settings
  FOR ALL USING (public.is_admin());
