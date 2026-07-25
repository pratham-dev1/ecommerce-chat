import { create } from "zustand";

import type { ProductSummary } from "@/features/catalog";

export type CartItem = ProductSummary & {
  quantity: number;
};

type CartState = {
  addItem: (product: ProductSummary, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  items: CartItem[];
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
};

function normalizeQuantity(quantity: number) {
  return Math.max(1, Math.floor(quantity));
}

function getItemCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export const useCartStore = create<CartState>((set) => ({
  addItem: (product, quantity) =>
    set((state) => {
      const normalizedQuantity = normalizeQuantity(quantity);
      const existingItem = state.items.find((item) => item.id === product.id);
      const items = existingItem
        ? state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + normalizedQuantity }
              : item,
          )
        : [...state.items, { ...product, quantity: normalizedQuantity }];

      return {
        itemCount: getItemCount(items),
        items,
      };
    }),
  clearCart: () => set({ itemCount: 0, items: [] }),
  itemCount: 0,
  items: [],
  removeItem: (productId) =>
    set((state) => {
      const items = state.items.filter((item) => item.id !== productId);

      return {
        itemCount: getItemCount(items),
        items,
      };
    }),
  updateItemQuantity: (productId, quantity) =>
    set((state) => {
      const normalizedQuantity = normalizeQuantity(quantity);
      const items = state.items.map((item) =>
        item.id === productId ? { ...item, quantity: normalizedQuantity } : item,
      );

      return {
        itemCount: getItemCount(items),
        items,
      };
    }),
}));
