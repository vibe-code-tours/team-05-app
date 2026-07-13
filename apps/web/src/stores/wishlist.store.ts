import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WishlistItem } from '@/types/wishlist';

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (productId: string) => boolean;
  getItemCount: () => number;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.productId === item.productId)) {
            return state;
          }
          return { items: [item, ...state.items] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      isInWishlist: (productId) =>
        get().items.some((i) => i.productId === productId),

      getItemCount: () => get().items.length,

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'crossmart-wishlist',
    }
  )
);
