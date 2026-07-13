import { Address } from '@/types/address';

export const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    recipientName: 'Win Naing Soe',
    phone: '+95 9 1234 56789',
    addressLine1: '42 Pyay Road, Block 10',
    addressLine2: 'Sanchaung Township',
    city: 'Yangon',
    state: 'Yangon Region',
    postalCode: '11111',
    country: 'Myanmar',
    isDefault: true,
    label: 'Home',
  },
  {
    id: 'addr-2',
    recipientName: 'Win Naing Soe',
    phone: '+95 9 9876 54321',
    addressLine1: '100 Business Center, Floor 5',
    addressLine2: 'Kamayut Township',
    city: 'Yangon',
    state: 'Yangon Region',
    postalCode: '11041',
    country: 'Myanmar',
    isDefault: false,
    label: 'Office',
  },
];
