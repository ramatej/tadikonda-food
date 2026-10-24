-- ============================================================================
-- Migration 03: Seed Initial Restaurants and Menu Items in Tadikonda
-- Tadikonda Food Delivery Application
-- ============================================================================

-- Insert Restaurants
INSERT INTO public.restaurants (
  id, name, tagline, cuisine, rating, review_count, delivery_time_minutes,
  price_for_two, image_url, cover_image_url, location_area, full_address,
  is_open, status, phone, featured
) VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'Sri Krishna Vilas Tiffins',
  'Famous for Guntur Karam Ghee Dosa & Babai Idli',
  ARRAY['South Indian', 'Tiffins', 'Breakfast'],
  4.8, 1240, 20, 180,
  'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
  'Main Bazar Center',
  'Door No 2-14, Main Bazar Road, Tadikonda, Guntur Dist - 522236',
  TRUE, 'active', '+91 98480 11223', TRUE
),
(
  'a0000000-0000-0000-0000-000000000002',
  'Amaravathi Royal Biryani Point',
  'Authentic Guntur Gongura & Hyderabadi Dum Biryani',
  ARRAY['Biryani', 'Andhra', 'North Indian'],
  4.7, 980, 25, 350,
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1200&q=80',
  'Near RTC Bus Stand',
  'RTC Complex Road, Opp. Sivalayam, Tadikonda - 522236',
  TRUE, 'active', '+91 94405 67890', TRUE
),
(
  'a0000000-0000-0000-0000-000000000003',
  'Tadikonda Ruchulu Bhojanam',
  'Home style Andhra Bhojanam & Natukodi Special',
  ARRAY['Andhra Meals', 'South Indian', 'Thali'],
  4.6, 750, 25, 240,
  'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80',
  'Police Station Road',
  'Near Police Station, Amaravathi Road, Tadikonda - 522236',
  TRUE, 'active', '+91 88976 12345', FALSE
),
(
  'a0000000-0000-0000-0000-000000000004',
  'Annapurna Sweets & Bakery',
  'Fresh Milk Sweets, Kaja, Pootharekulu & Hot Puffs',
  ARRAY['Sweets', 'Bakery', 'Snacks'],
  4.8, 1120, 15, 160,
  'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
  'Ramalayam Temple Road',
  'Beside Ramalayam, Main Road, Tadikonda - 522236',
  TRUE, 'active', '+91 98485 55443', TRUE
),
(
  'a0000000-0000-0000-0000-000000000005',
  'Guntur Mirchi Bajji & Fast Food',
  'Evening Hot Bajjilu, Pakoda & Chicken Fried Rice',
  ARRAY['Street Food', 'Snacks', 'Fast Food'],
  4.5, 640, 20, 150,
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  'Agricultural Market Yard',
  'Market Yard Gate, Tadikonda - 522236',
  TRUE, 'active', '+91 97012 34567', FALSE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  rating = EXCLUDED.rating;

-- Insert Menu Items
INSERT INTO public.menu_items (
  id, restaurant_id, name, description, price, original_price,
  image_url, category, is_veg, is_available, is_bestseller, rating, review_count, preparation_time_minutes
) VALUES
-- Sri Krishna Vilas Tiffins
(
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Guntur Karam Ghee Dosa',
  'Crispy fermented crepe smeared with pure desi ghee and fiery Guntur red chilli karam podi. Served with freshly ground peanut and allam (ginger) chutney.',
  90.00, 110.00,
  'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
  'tiffins', TRUE, TRUE, TRUE, 4.9, 520, 15
),
(
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'Ghee Babai Idli (4 Pcs) + Vada (1 Pc)',
  'Melt-in-mouth steamed rice cakes topped with a generous cube of butter and podi, with crispy medu vada and hot sambar.',
  80.00, NULL,
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  'tiffins', TRUE, TRUE, TRUE, 4.8, 410, 10
),
(
  'b0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'MLA Pesarattu with Upma',
  'Whole green gram moong dosa stuffed with piping hot Bombay ravva upma and served with authentic Andhra allam pachadi.',
  95.00, 115.00,
  'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=600&q=80',
  'tiffins', TRUE, TRUE, FALSE, 4.7, 310, 15
),
(
  'b0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000001',
  'Degree Filter Coffee',
  'Traditional south Indian chicory-blend fresh milk brew frothed in brass dabara and tumbler.',
  30.00, NULL,
  'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
  'beverages', TRUE, TRUE, FALSE, 4.8, 220, 5
),
-- Amaravathi Royal Biryani Point
(
  'b0000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000002',
  'Andhra Special Gongura Chicken Dum Biryani',
  'Signature fragrant long-grain basmati rice cooked on dum with tender spiced country chicken and sour, tangy Guntur gongura masala.',
  240.00, 280.00,
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  'biryani', FALSE, TRUE, TRUE, 4.8, 680, 20
),
(
  'b0000000-0000-0000-0000-000000000006',
  'a0000000-0000-0000-0000-000000000002',
  'Guntur Mirchi Chicken Fry (Dry)',
  'Boneless chicken cubes tossed with roasted crushed Guntur red chillies, curry leaves, and coastal Andhra spices.',
  210.00, NULL,
  'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
  'snacks', FALSE, TRUE, TRUE, 4.7, 390, 20
),
(
  'b0000000-0000-0000-0000-000000000007',
  'a0000000-0000-0000-0000-000000000002',
  'Royal Paneer Dum Biryani (Veg)',
  'Marinated cottage cheese layered with saffron-infused basmati rice, caramelized onions, and fresh mint leaves.',
  200.00, NULL,
  'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=600&q=80',
  'biryani', TRUE, TRUE, FALSE, 4.6, 230, 20
),
-- Tadikonda Ruchulu Bhojanam
(
  'b0000000-0000-0000-0000-000000000008',
  'a0000000-0000-0000-0000-000000000003',
  'Andhra Veg Bhojanam Meals Carrier',
  'Steaming Sona Masoori rice, Guntur tomato pappu, avakaya pachadi, gun powder (kandi podi) with pure ghee, sambar, rasam, curd, fry, and sweet.',
  150.00, NULL,
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
  'meals', TRUE, TRUE, TRUE, 4.7, 410, 15
),
(
  'b0000000-0000-0000-0000-000000000009',
  'a0000000-0000-0000-0000-000000000003',
  'Village Style Natukodi Pulusu',
  'Traditional country chicken stewed in earthen pots with roasted poppy seeds, coconut, and spicy regional masala.',
  220.00, NULL,
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  'meals', FALSE, TRUE, FALSE, 4.8, 290, 25
),
-- Annapurna Sweets & Bakery
(
  'b0000000-0000-0000-0000-000000000010',
  'a0000000-0000-0000-0000-000000000004',
  'Madatha Kaja & Pootharekulu Box (250g)',
  'Crisp layered juicy Kajas soaked in sugar syrup along with delicate ghee-coated Atreyapuram rice-paper sweets.',
  140.00, 160.00,
  'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
  'sweets', TRUE, TRUE, TRUE, 4.9, 510, 5
),
(
  'b0000000-0000-0000-0000-000000000011',
  'a0000000-0000-0000-0000-000000000004',
  'Hot Crispy Egg Puff (Pack of 2)',
  'Flaky golden puff pastry stuffed with boiled spiced egg masala, fresh from the oven.',
  60.00, NULL,
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'snacks', FALSE, TRUE, FALSE, 4.6, 320, 5
),
-- Guntur Mirchi Bajji & Fast Food
(
  'b0000000-0000-0000-0000-000000000012',
  'a0000000-0000-0000-0000-000000000005',
  'Cut Mirchi Bajji with Stuffed Onions (4 Pcs)',
  'Plump long green chillies dipped in spiced chickpea batter, fried crisp, slit, and filled with roasted peanuts, lemon, and chopped onions.',
  60.00, NULL,
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
  'snacks', TRUE, TRUE, TRUE, 4.8, 470, 10
),
(
  'b0000000-0000-0000-0000-000000000013',
  'a0000000-0000-0000-0000-000000000005',
  'Street Style Chicken Fried Rice',
  'Wok-tossed aromatic rice with shredded chicken, crunchy cabbage, spring onions, and green chilli sauce.',
  130.00, NULL,
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
  'snacks', FALSE, TRUE, FALSE, 4.5, 340, 15
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price;
