import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Product } from "@/types/product";

type CartItem = Product & {
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
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
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "3fstore-cart",
    },
  ),
);
