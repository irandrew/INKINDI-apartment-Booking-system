export type UserRole = 'super_admin' | 'property_manager' | 'guest';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
}

export interface Apartment {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  images: string[];
  location: string;
  amenities: string[];
  capacity: number;
}

export interface Booking {
  id: string;
  apartmentId: string;
  apartmentName?: string;
  guestUid?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: string;
  createdAt: string;
}
