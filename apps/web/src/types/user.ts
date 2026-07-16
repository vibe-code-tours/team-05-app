export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SELLER' | 'CLIENT';
  avatar?: string;
}
