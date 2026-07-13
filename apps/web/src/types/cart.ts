export interface CartItem {
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

export interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}
