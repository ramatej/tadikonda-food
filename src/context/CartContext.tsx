import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, Cart } from '../types';
import { APP_CONFIG, DEMO_VOUCHERS } from '../config/constants';
import { useToast } from './ToastContext';

interface RestaurantConflictModalState {
  isOpen: boolean;
  newItem: MenuItem | null;
  newRestaurantId: string;
  newRestaurantName: string;
}

interface CartContextType {
  cart: Cart;
  cartItemCount: number;
  addItem: (item: MenuItem, quantity?: number) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  applyVoucher: (code: string) => { success: boolean; message: string };
  removeVoucher: () => void;
  conflictState: RestaurantConflictModalState;
  resolveConflict: (confirmReplace: boolean) => void;
}

const CART_STORAGE_KEY = 'tkd_food_cart_v1';

const initialCart: Cart = {
  restaurantId: null,
  restaurantName: null,
  items: [],
  subtotal: 0,
  deliveryFee: APP_CONFIG.defaultDeliveryFee,
  discount: 0,
  total: APP_CONFIG.defaultDeliveryFee,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [cart, setCart] = useState<Cart>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load cart', e);
    }
    return initialCart;
  });

  const [conflictState, setConflictState] = useState<RestaurantConflictModalState>({
    isOpen: false,
    newItem: null,
    newRestaurantId: '',
    newRestaurantName: '',
  });

  // Calculate cart totals
  const recalculateCart = (
    items: CartItem[],
    restaurantId: string | null,
    restaurantName: string | null,
    voucherCode?: string
  ): Cart => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = items.length > 0 ? APP_CONFIG.defaultDeliveryFee : 0;
    let discount = 0;

    if (voucherCode && subtotal > 0) {
      const voucher = DEMO_VOUCHERS.find(
        (v) => v.code.toUpperCase() === voucherCode.toUpperCase()
      );
      if (voucher && subtotal >= voucher.minimumOrder) {
        discount = voucher.discountAmount;
      }
    }

    const total = Math.max(0, subtotal - discount + deliveryFee);

    return {
      restaurantId: items.length > 0 ? restaurantId : null,
      restaurantName: items.length > 0 ? restaurantName : null,
      items,
      subtotal,
      deliveryFee,
      discount,
      voucherCode: discount > 0 ? voucherCode : undefined,
      total,
    };
  };

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed saving cart', e);
    }
  }, [cart]);

  const addItem = (item: MenuItem, quantity: number = 1) => {
    if (!item.isAvailable) {
      showToast(`${item.name} is currently sold out`, 'error');
      return;
    }

    // Check restaurant conflict
    if (cart.restaurantId && cart.restaurantId !== item.restaurantId && cart.items.length > 0) {
      setConflictState({
        isOpen: true,
        newItem: item,
        newRestaurantId: item.restaurantId,
        newRestaurantName: item.restaurantName,
      });
      return;
    }

    const existingIndex = cart.items.findIndex((i) => i.menuItemId === item.id);
    let newItems: CartItem[];

    if (existingIndex > -1) {
      newItems = [...cart.items];
      newItems[existingIndex].quantity += quantity;
    } else {
      const newCartItem: CartItem = {
        id: `citem_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        menuItemId: item.id,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        isVeg: item.isVeg,
        quantity,
      };
      newItems = [...cart.items, newCartItem];
    }

    const updated = recalculateCart(
      newItems,
      item.restaurantId,
      item.restaurantName,
      cart.voucherCode
    );
    setCart(updated);
    showToast(`Added ${item.name} to cart`, 'success');
  };

  const resolveConflict = (confirmReplace: boolean) => {
    if (confirmReplace && conflictState.newItem) {
      const item = conflictState.newItem;
      const newCartItem: CartItem = {
        id: `citem_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        menuItemId: item.id,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        isVeg: item.isVeg,
        quantity: 1,
      };
      const updated = recalculateCart([newCartItem], item.restaurantId, item.restaurantName);
      setCart(updated);
      showToast(`Cart replaced with items from ${item.restaurantName}`, 'info');
    }
    setConflictState({
      isOpen: false,
      newItem: null,
      newRestaurantId: '',
      newRestaurantName: '',
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    const newItems = cart.items.map((i) =>
      i.id === itemId ? { ...i, quantity: newQuantity } : i
    );
    const updated = recalculateCart(
      newItems,
      cart.restaurantId,
      cart.restaurantName,
      cart.voucherCode
    );
    setCart(updated);
  };

  const removeItem = (itemId: string) => {
    const target = cart.items.find((i) => i.id === itemId);
    const newItems = cart.items.filter((i) => i.id !== itemId);
    const updated = recalculateCart(
      newItems,
      cart.restaurantId,
      cart.restaurantName,
      cart.voucherCode
    );
    setCart(updated);
    if (target) {
      showToast(`Removed ${target.name} from cart`, 'info');
    }
  };

  const clearCart = () => {
    setCart(initialCart);
    showToast('Cart cleared', 'info');
  };

  const applyVoucher = (code: string) => {
    const voucher = DEMO_VOUCHERS.find(
      (v) => v.code.toUpperCase() === code.trim().toUpperCase()
    );
    if (!voucher) {
      return { success: false, message: 'Invalid promo code. Try TADIKONDA50 or FIRSTORDER.' };
    }
    if (cart.subtotal < voucher.minimumOrder) {
      return {
        success: false,
        message: `Minimum order amount of ₹${voucher.minimumOrder} required for ${voucher.code}.`,
      };
    }

    const updated = recalculateCart(
      cart.items,
      cart.restaurantId,
      cart.restaurantName,
      voucher.code
    );
    setCart(updated);
    showToast(`Voucher ${voucher.code} applied! Saved ₹${voucher.discountAmount}`, 'success');
    return { success: true, message: `Voucher applied: Saved ₹${voucher.discountAmount}` };
  };

  const removeVoucher = () => {
    const updated = recalculateCart(cart.items, cart.restaurantId, cart.restaurantName, undefined);
    setCart(updated);
    showToast('Voucher removed', 'info');
  };

  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItemCount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyVoucher,
        removeVoucher,
        conflictState,
        resolveConflict,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
