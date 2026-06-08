import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Product } from "@/types/product";

type CartItem = Product & {
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  setItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,
      addItem: (product, quantity = 1) =>
        set((state) => {
          const normalizedQuantity = Math.max(1, Math.floor(quantity));
          const existingItem = state.items.find(
            (item) => item.id === product.id,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + normalizedQuantity,
                    }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              { ...product, quantity: normalizedQuantity },
            ],
          };
        }),
      setItemQuantity: (productId, quantity) =>
        set((state) => {
          const normalizedQuantity = Math.max(0, Math.floor(quantity));

          if (normalizedQuantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== productId),
            };
          }

          return {
            items: state.items.map((item) =>
              item.id === productId
                ? { ...item, quantity: normalizedQuantity }
                : item,
            ),
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
    }),
    {
      name: "3fstore-cart",
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);
