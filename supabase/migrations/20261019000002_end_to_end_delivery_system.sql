-- ============================================================================
-- Migration 06: End-to-End Database-Driven Food Delivery System
-- Tadikonda Food Delivery Application
-- ============================================================================

-- 1. Orders table schema enhancements
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS restaurant_name TEXT,
  ADD COLUMN IF NOT EXISTS restaurant_phone TEXT,
  ADD COLUMN IF NOT EXISTS restaurant_address TEXT,
  ADD COLUMN IF NOT EXISTS delivery_partner_name TEXT,
  ADD COLUMN IF NOT EXISTS delivery_partner_phone TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery_time_minutes INT DEFAULT 25,
  ADD COLUMN IF NOT EXISTS status_history JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Delivery partner profiles enhancements
ALTER TABLE public.delivery_partner_profiles
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 4.80,
  ADD COLUMN IF NOT EXISTS total_deliveries INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS todays_deliveries INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS todays_earnings NUMERIC(10,2) DEFAULT 0.00;

-- 3. Add orders table to Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- 4. Enable RLS on all tables and refine policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow restaurant owners and admins to select delivery partner profiles for order assignment
DROP POLICY IF EXISTS "delivery_profiles_select_owners_and_admins" ON public.delivery_partner_profiles;
CREATE POLICY "delivery_profiles_select_owners_and_admins" ON public.delivery_partner_profiles
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    public.is_admin() OR 
    (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('restaurant_owner', 'admin'))
      AND approval_status = 'approved'
    )
  );

-- 5. Atomic Order Creation Procedure
CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_restaurant_id UUID,
  p_delivery_address JSONB,
  p_items JSONB,
  p_payment_method TEXT DEFAULT 'cod',
  p_customer_notes TEXT DEFAULT NULL,
  p_voucher_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_customer RECORD;
  v_restaurant RECORD;
  v_delivery_fee NUMERIC(10,2) := 20.00;
  v_item_subtotal NUMERIC(10,2) := 0.00;
  v_discount NUMERIC(10,2) := 0.00;
  v_total NUMERIC(10,2) := 0.00;
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
  v_menu_item RECORD;
  v_qty INT;
  v_status_history JSONB;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- 1. Verify authenticated user
  v_customer_id := auth.uid();
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to place an order';
  END IF;

  SELECT * INTO v_customer FROM public.profiles WHERE id = v_customer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer profile not found for user %', v_customer_id;
  END IF;

  -- 2. Validate restaurant
  SELECT * INTO v_restaurant FROM public.restaurants WHERE id = p_restaurant_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Restaurant % does not exist', p_restaurant_id;
  END IF;

  IF v_restaurant.status NOT IN ('approved', 'active') THEN
    RAISE EXCEPTION 'Restaurant % is not currently authorized to accept orders', v_restaurant.name;
  END IF;

  IF NOT v_restaurant.is_open THEN
    RAISE EXCEPTION 'Restaurant % is currently closed', v_restaurant.name;
  END IF;

  -- 3. Validate items array
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  -- 4. Get platform settings for delivery fee
  SELECT COALESCE(delivery_fee, 20.00) INTO v_delivery_fee 
  FROM public.platform_settings 
  WHERE id = 'current';

  -- 5. Calculate authoritative item subtotal from trusted menu_items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := COALESCE((v_item->>'quantity')::INT, 1);
    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity % for item', v_qty;
    END IF;

    SELECT * INTO v_menu_item 
    FROM public.menu_items 
    WHERE id = (v_item->>'menuItemId')::UUID AND restaurant_id = p_restaurant_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Menu item % not found in restaurant %', v_item->>'menuItemId', v_restaurant.name;
    END IF;

    IF NOT v_menu_item.is_available THEN
      RAISE EXCEPTION 'Item "%" is currently out of stock', v_menu_item.name;
    END IF;

    v_item_subtotal := v_item_subtotal + (v_menu_item.price * v_qty);
  END LOOP;

  -- 6. Validate discount voucher
  IF p_voucher_code IS NOT NULL AND p_voucher_code <> '' THEN
    IF UPPER(p_voucher_code) = 'TADIKONDA20' AND v_item_subtotal >= 150 THEN
      v_discount := 20.00;
    ELSIF UPPER(p_voucher_code) = 'FIRST50' AND v_item_subtotal >= 100 THEN
      v_discount := LEAST(50.00, v_item_subtotal * 0.50);
    ELSE
      v_discount := 0.00;
    END IF;
  END IF;

  v_total := GREATEST(0.00, v_item_subtotal + v_delivery_fee - v_discount);

  -- 7. Generate order number (e.g. TKD-4892)
  LOOP
    v_order_number := 'TKD-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = v_order_number);
  END LOOP;

  v_order_id := gen_random_uuid();
  v_status_history := jsonb_build_array(
    jsonb_build_object(
      'status', 'placed',
      'timestamp', v_now,
      'note', 'Order placed by customer in Tadikonda'
    )
  );

  -- 8. Insert authoritative order
  INSERT INTO public.orders (
    id,
    order_number,
    customer_id,
    customer_name,
    customer_phone,
    restaurant_id,
    restaurant_name,
    restaurant_phone,
    restaurant_address,
    status,
    item_subtotal,
    delivery_fee,
    discount,
    total,
    voucher_code,
    payment_method,
    payment_status,
    delivery_address,
    customer_notes,
    status_history,
    estimated_delivery_time_minutes,
    created_at,
    updated_at
  ) VALUES (
    v_order_id,
    v_order_number,
    v_customer_id,
    COALESCE(v_customer.full_name, 'Tadikonda Resident'),
    COALESCE(v_customer.phone, p_delivery_address->>'phone', ''),
    p_restaurant_id,
    v_restaurant.name,
    v_restaurant.phone,
    v_restaurant.full_address,
    'placed',
    v_item_subtotal,
    v_delivery_fee,
    v_discount,
    v_total,
    p_voucher_code,
    COALESCE(p_payment_method, 'cod'),
    'pending',
    p_delivery_address,
    p_customer_notes,
    v_status_history,
    25,
    v_now,
    v_now
  );

  -- 9. Insert order items snapshot
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::INT;

    SELECT * INTO v_menu_item 
    FROM public.menu_items 
    WHERE id = (v_item->>'menuItemId')::UUID;

    INSERT INTO public.order_items (
      order_id,
      menu_item_id,
      name,
      price,
      quantity,
      is_veg,
      image_url,
      created_at
    ) VALUES (
      v_order_id,
      v_menu_item.id,
      v_menu_item.name,
      v_menu_item.price,
      v_qty,
      v_menu_item.is_veg,
      v_menu_item.image_url,
      v_now
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total', v_total,
    'status', 'placed',
    'created_at', v_now
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order_atomic(UUID, JSONB, JSONB, TEXT, TEXT, TEXT) TO authenticated;

-- 6. Secure Order Status Transitions Procedure
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id UUID,
  p_status TEXT,
  p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_order RECORD;
  v_restaurant RECORD;
  v_is_owner BOOLEAN := FALSE;
  v_is_assigned_partner BOOLEAN := FALSE;
  v_is_platform_admin BOOLEAN := FALSE;
  v_now TIMESTAMPTZ := NOW();
  v_new_history JSONB;
BEGIN
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_is_platform_admin := public.is_admin();

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  SELECT * INTO v_restaurant FROM public.restaurants WHERE id = v_order.restaurant_id;
  v_is_owner := (v_restaurant.owner_id = v_caller_id);
  v_is_assigned_partner := (v_order.delivery_partner_id = v_caller_id);

  -- State machine authorization:
  -- Restaurant owner: placed -> confirmed -> preparing -> ready_for_pickup, or placed/confirmed -> cancelled
  -- Delivery partner: ready_for_pickup -> out_for_delivery -> delivered
  -- Customer: placed -> cancelled
  IF p_status IN ('confirmed', 'preparing', 'ready_for_pickup') THEN
    IF NOT (v_is_owner OR v_is_platform_admin) THEN
      RAISE EXCEPTION 'Only the restaurant owner can mark order as %', p_status;
    END IF;
  ELSIF p_status = 'out_for_delivery' THEN
    IF NOT (v_is_assigned_partner OR v_is_platform_admin) THEN
      RAISE EXCEPTION 'Only the assigned delivery partner can start delivery';
    END IF;
    IF v_order.status <> 'ready_for_pickup' THEN
      RAISE EXCEPTION 'Order must be ready for pickup before starting delivery (current: %)', v_order.status;
    END IF;
  ELSIF p_status = 'delivered' THEN
    IF NOT (v_is_assigned_partner OR v_is_platform_admin) THEN
      RAISE EXCEPTION 'Only the assigned delivery partner can complete delivery';
    END IF;
    IF v_order.status <> 'out_for_delivery' THEN
      RAISE EXCEPTION 'Order must be out for delivery before marking delivered (current: %)', v_order.status;
    END IF;
  ELSIF p_status = 'cancelled' THEN
    IF NOT (v_is_owner OR v_is_platform_admin OR (v_order.customer_id = v_caller_id AND v_order.status = 'placed')) THEN
      RAISE EXCEPTION 'Unauthorized cancellation request';
    END IF;
  END IF;

  -- Append to status history
  v_new_history := COALESCE(v_order.status_history, '[]'::jsonb) || jsonb_build_object(
    'status', p_status,
    'timestamp', v_now,
    'note', COALESCE(p_note, 'Status updated to ' || p_status)
  );

  -- Update order record
  UPDATE public.orders
  SET 
    status = p_status,
    status_history = v_new_history,
    payment_status = CASE WHEN p_status = 'delivered' AND payment_method = 'cod' THEN 'paid' ELSE payment_status END,
    updated_at = v_now
  WHERE id = p_order_id;

  -- If marked delivered, update delivery partner stats
  IF p_status = 'delivered' AND v_order.delivery_partner_id IS NOT NULL THEN
    UPDATE public.delivery_partner_profiles
    SET 
      todays_deliveries = todays_deliveries + 1,
      total_deliveries = total_deliveries + 1,
      todays_earnings = todays_earnings + 40.00,
      updated_at = v_now
    WHERE user_id = v_order.delivery_partner_id;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', p_order_id,
    'status', p_status,
    'updated_at', v_now
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_order_status(UUID, TEXT, TEXT) TO authenticated;

-- 7. Restaurant Assign Delivery Partner Procedure
CREATE OR REPLACE FUNCTION public.assign_order_delivery_partner(
  p_order_id UUID,
  p_delivery_partner_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_order RECORD;
  v_restaurant RECORD;
  v_partner_profile RECORD;
  v_partner_user RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_new_history JSONB;
BEGIN
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  SELECT * INTO v_restaurant FROM public.restaurants WHERE id = v_order.restaurant_id;
  IF NOT (v_restaurant.owner_id = v_caller_id OR public.is_admin()) THEN
    RAISE EXCEPTION 'Unauthorized: Only the restaurant owner can assign delivery partners';
  END IF;

  IF v_order.status NOT IN ('confirmed', 'preparing', 'ready_for_pickup') THEN
    RAISE EXCEPTION 'Cannot assign partner while order is in % status', v_order.status;
  END IF;

  -- Validate delivery partner
  SELECT * INTO v_partner_profile 
  FROM public.delivery_partner_profiles 
  WHERE user_id = p_delivery_partner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Delivery partner profile not found';
  END IF;

  IF v_partner_profile.approval_status <> 'approved' THEN
    RAISE EXCEPTION 'Delivery partner is not approved on the platform';
  END IF;

  IF v_partner_profile.availability_status <> 'online' THEN
    RAISE EXCEPTION 'Delivery partner is currently offline';
  END IF;

  SELECT * INTO v_partner_user FROM public.profiles WHERE id = p_delivery_partner_id;

  -- Append to status history
  v_new_history := COALESCE(v_order.status_history, '[]'::jsonb) || jsonb_build_object(
    'status', v_order.status,
    'timestamp', v_now,
    'note', 'Assigned delivery partner: ' || COALESCE(v_partner_user.full_name, 'Partner')
  );

  UPDATE public.orders
  SET 
    delivery_partner_id = p_delivery_partner_id,
    delivery_partner_name = COALESCE(v_partner_user.full_name, 'Tadikonda Express Partner'),
    delivery_partner_phone = COALESCE(v_partner_profile.phone, v_partner_user.phone, ''),
    status_history = v_new_history,
    updated_at = v_now
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', p_order_id,
    'delivery_partner_id', p_delivery_partner_id,
    'delivery_partner_name', v_partner_user.full_name,
    'updated_at', v_now
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_order_delivery_partner(UUID, UUID) TO authenticated;

-- 8. Eligible Delivery Partners Query for Restaurant Owners
CREATE OR REPLACE FUNCTION public.get_eligible_delivery_partners()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  phone TEXT,
  vehicle_type TEXT,
  vehicle_number TEXT,
  rating NUMERIC,
  active_deliveries BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('restaurant_owner', 'admin'))) THEN
    RAISE EXCEPTION 'Unauthorized: Only restaurant owners and admins can view eligible partners';
  END IF;

  RETURN QUERY
  SELECT 
    dp.id,
    dp.user_id,
    COALESCE(p.full_name, 'Delivery Partner') AS name,
    COALESCE(dp.phone, p.phone, '') AS phone,
    COALESCE(dp.vehicle_type, 'Bike') AS vehicle_type,
    COALESCE(dp.vehicle_number, 'AP 07') AS vehicle_number,
    COALESCE(dp.rating, 4.80) AS rating,
    COUNT(o.id) FILTER (WHERE o.status IN ('ready_for_pickup', 'out_for_delivery')) AS active_deliveries
  FROM public.delivery_partner_profiles dp
  JOIN public.profiles p ON dp.user_id = p.id
  LEFT JOIN public.orders o ON o.delivery_partner_id = dp.user_id
  WHERE dp.approval_status = 'approved'
    AND dp.availability_status = 'online'
  GROUP BY dp.id, dp.user_id, p.full_name, dp.phone, p.phone, dp.vehicle_type, dp.vehicle_number, dp.rating
  ORDER BY active_deliveries ASC, dp.rating DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_eligible_delivery_partners() TO authenticated;

-- 9. Delivery Partner Online Toggle
CREATE OR REPLACE FUNCTION public.toggle_delivery_partner_online(p_is_online BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_new_status TEXT;
  v_dp RECORD;
BEGIN
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_dp FROM public.delivery_partner_profiles WHERE user_id = v_caller_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Delivery partner profile not found';
  END IF;

  IF v_dp.approval_status <> 'approved' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Account pending administrator verification';
  END IF;

  v_new_status := CASE WHEN p_is_online THEN 'online' ELSE 'offline' END;

  UPDATE public.delivery_partner_profiles
  SET 
    availability_status = v_new_status,
    updated_at = NOW()
  WHERE user_id = v_caller_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'is_online', p_is_online,
    'availability_status', v_new_status
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_delivery_partner_online(BOOLEAN) TO authenticated;
