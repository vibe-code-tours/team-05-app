export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: string;
  stock: number;
  inStock: boolean;
  addedAt: string;
}
