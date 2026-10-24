# 🍛 Tadikonda Food — Local Food Delivery Web Application

A modern, responsive, high-fidelity food delivery web application inspired by **Swiggy**, customized for **Tadikonda village, Guntur district, Andhra Pradesh, India**. Built with React, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, and React Router.

---

## 📸 Reference Design Reproduction

The UI reproduces the 3 reference screens with precision:

1. **Screen 1 — Home & Discovery (`/`)**:
   - **Header & Location**: Interactive location switcher for Tadikonda localities (*Main Bazar Center*, *Near RTC Bus Stand*, *Ramalayam Temple Road*, etc.) + Cart badge indicator.
   - **Search & Filter Row**: Pill search input + vibrant orange "Filter" pill button.
   - **Hero Promotional Banner**: Warm gradient card (*"Gonna Be a Good Day!"*, *"Free delivery, lower fees, & 10% cashback, pickup!"*, *"Order Now"* CTA, authentic food imagery).
   - **Categories**: Horizontal circular thumbnail chips (*Tiffins*, *Biryani*, *Andhra Meals*, *Snacks & Bajji*, *Sweets*, *Beverages*) with *"See All"*.
   - **Picks For You**: Cards featuring food cover photo, glassmorphic rating badge (`★ 4.7 (2.3k)`), favorite heart toggle, restaurant info, and orange circular action button (`↗`).
   - **Bottom Navigation**: Mobile bottom bar (*Home*, *Orders*, *Offers*, *Profile*).

2. **Screen 2 — Food & Restaurant Item Details (`FoodDetailModal`)**:
   - Floating circular back button, favorite heart button, and share button.
   - Hero food photography with smooth rounded bottom contours.
   - Slid-up white card with item name, restaurant subtitle, rating badge.
   - **Chef & Prep Card**: Head chef avatar (*K. Sambasiva Rao*, ID #TKD-CHEF-01, quick chat and call buttons).
   - Description with expandable *"Read more"* toggle.
   - Side-by-side delivery spec cards (*25 min Delivery Time*, *Tadikonda Express*).
   - Sticky bottom action bar: Orange price pill (`₹90.00`) + *"Add to Cart"* quantity stepper.

3. **Screen 3 — Cart & Checkout (`/cart` & `/checkout`)**:
   - Header with back navigation, cart options, and active restaurant indicator.
   - Cart item list with item image, restaurant subtitle, rating, price, and `- 1 +` quantity stepper with orange plus button.
   - **Voucher Entry Bar**: *"Enter your voucher code >"* with 1-click application for `TADIKONDA50`, `FIRSTORDER`, and `GUNTURSPICE`.
   - **Bill Summary**: Item Subtotal, **Fixed ₹20 Tadikonda Delivery Fee**, Promo Discount, Dashed separator line, Total Amount.
   - Sticky bottom action bar: Orange total amount pill (`₹210.00`) + *"Checkout"* CTA.

---

## 🛠️ Technology Stack

- **React 19** with **TypeScript** (Strict mode)
- **Vite 6** (Blazing fast HMR and optimized bundler)
- **Tailwind CSS v4** (`@tailwindcss/vite` modern CSS engine)
- **React Router 7** (Client-side routing)
- **Lucide React** (Consistent icon library)
- **Supabase JS Client** (`@supabase/supabase-js`, architectural integration ready)
- **Mock Service Layer** (`mockStorage.ts`, reactive storage event dispatching)

---

## 🏗️ Architecture & Folder Structure

```
src/
├── app/
├── types/                     # Centralized domain types (User, Order, Restaurant, MenuItem, etc.)
├── config/                    # App constants, Tadikonda localities, demo accounts, vouchers
│   └── constants.ts
├── data/                      # Realistic seed data for Tadikonda & Guntur food culture
│   └── mockData.ts
├── services/
│   ├── interfaces/            # Pure TypeScript service interfaces (IOrderService, IRestaurantService, etc.)
│   ├── mock/                  # Full mock service implementations & localStorage persistence
│   │   ├── mockStorage.ts
│   │   └── index.ts
│   └── supabase/              # Supabase client with safe environment fallbacks
│       └── client.ts
├── context/                   # Scoped React Contexts
│   ├── AuthContext.tsx        # User session & live role switcher
│   ├── CartContext.tsx        # Cart state, ₹20 fee, vouchers & multi-restaurant conflict modal
│   ├── OrderContext.tsx       # Real-time reactive order lifecycle
│   └── ToastContext.tsx       # Global toast notification queue
├── components/
│   ├── ui/                    # Button, Badge, Modal primitives
│   ├── common/                # RoleSwitcher, Toast, Empty states
│   ├── layout/                # Header, MobileNav, Footer, Layout wrapper
│   ├── restaurant/            # RestaurantCard, CategoryList
│   ├── food/                  # FoodItemCard, FoodDetailModal
│   ├── cart/                  # CartItemRow
│   └── orders/                # OrderStatusTimeline
├── pages/
│   ├── public/                # HomePage, RestaurantsPage, RestaurantDetailPage, SearchPage
│   ├── customer/              # CartPage, CheckoutPage, OrderTrackingPage, OrderHistoryPage, ProfilePage, AddressesPage, OffersPage
│   ├── restaurant/            # RestaurantDashboardPage, RestaurantRegistrationPage
│   ├── delivery/              # DeliveryDashboardPage
│   ├── admin/                 # AdminDashboardPage
│   ├── auth/                  # LoginPage, RegisterPage, ForgotPasswordPage
│   └── errors/                # NotFoundPage
└── routes/
    └── AppRoutes.tsx
```

---

## 👥 Demo Accounts & 1-Click Role Switcher

A floating **Demo Role Switcher** is present at the top of every screen to let testers test the end-to-end lifecycle across all 4 platform roles:

| Role | Demo User | Description |
|---|---|---|
| **Customer** | Sravan Varma | Browse restaurants, add dishes, apply coupons, place demo orders, track status live, leave reviews |
| **Restaurant Owner** | K. Sambasiva Rao (*Sri Krishna Vilas*) | Incoming orders, accept & start cooking, mark ready for pickup, toggle menu stock, toggle open/close |
| **Delivery Partner** | Ramesh Kumar (*Hero Splendor AP 07 BK 4492*) | Online/offline toggle, accept assignments, pick up from shop, confirm delivery, view earnings |
| **Platform Admin** | Tadikonda Admin | Review platform volume, approve new restaurant registrations, inspect all orders, configure delivery fee |

---

## ⚡ Order Lifecycle State Machine

When a customer places an order:
1. `placed`: Created in customer session, appears in Restaurant's incoming orders.
2. `confirmed`: Restaurant clicks **"Accept Order"**.
3. `preparing`: Restaurant clicks **"Start Cooking"** (Chef starts preparing fresh hot food).
4. `ready_for_pickup`: Restaurant marks **"Ready for Pickup"**. Notifies Delivery Partner.
5. `out_for_delivery`: Delivery Partner clicks **"Confirm Pickup & Start Delivery"**.
6. `delivered`: Delivery Partner clicks **"Confirm Delivered"** upon handing over food to customer. Customer can now leave a 1-5 star review.

*(Testers can also use the **"Advance Status Simulator"** on the Order Tracking page to test state transitions immediately).*

---

## 💳 Deferred Integrations (Phase 2 Roadmap)

The following integrations are intentionally deferred and prepared cleanly behind architectural service interfaces:

- **Live Supabase Backend**: Auth (Email + Phone SMS OTP), PostgreSQL database tables with Row Level Security (RLS), Realtime WebSocket subscriptions, and Supabase Storage image buckets.
- **Payment Gateway**: Real Razorpay / Cashfree UPI & card payments. Cash on Delivery and UPI are currently simulated for demo orders.
- **SMS / WhatsApp Notifications**: Real OTP SMS delivery to Indian mobile numbers.
- **GPS Live Maps**: Live geolocation tracking of delivery partners via Google Maps / Mapbox.
- **Mobile App**: Capacitor / React Native wrapping for Android APK release.

---

## 🚀 Running the Project Locally

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
# -> Opens http://localhost:5173/

# Typecheck and production build
npm run build
```
