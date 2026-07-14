/**
 * Cart types — canonical source for cart-related data shapes.
 * API-level types match the backend response structure.
 */

/** A single item in the cart (as returned by the API). */
export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
  };
  quantity: number;
  totalPrice: number;
}

/** Full cart response from the API. */
export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

/** Input for adding an item to the cart. */
export interface AddToCartInput {
  productId: string;
  quantity: number;
}

/** Input for updating a cart item quantity. */
export interface UpdateCartItemInput {
  itemId: string;
  quantity: number;
}

/** Client-side cart summary for display. */
export interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

/**
 * Flat cart item for client-side state (Zustand store).
 * Derived from the API CartItem — use this in UI components that need
 * a simplified flat shape.
 */
export interface CartItemView {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
  stock: number;
  seller: string;
}
