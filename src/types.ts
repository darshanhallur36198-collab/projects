export interface LogisticsAgency {
  id: string;
  name: string;
  rating: number;
  specialties: string[];
  hubsCount: number;
  image: string;
  headquarters: string;
}

export interface ShipmentService {
  id: string;
  agencyId: string;
  name: string;
  description: string;
  basePrice: number;
  weightCategory: string;
}

export type ShipmentStatus = 'booked' | 'picked_up' | 'at_hub' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';

export interface Shipment {
  id: string;
  userId: string;
  agencyId: string;
  agencyName?: string;
  trackingNumber: string;
  parcelType: string;
  weight: number;
  sender: {
    name: string;
    address: string;
    phone: string;
  };
  receiver: {
    name: string;
    address: string;
    phone: string;
  };
  status: ShipmentStatus;
  totalCost: number;
  createdAt: any;
  updatedAt: any;
  preferredDeliveryDate?: string;
  deliverySlot?: string;
  driverLocation?: {
    lat: number;
    lng: number;
  };
  exceptionDetails?: {
    reason: string;
    code: string;
    resolutionSteps: string[];
  };
}

export interface UserProfile {
  uid: string;
  name?: string;
  email: string;
  avatar?: string;
  favorites?: string[];
  fcmTokens?: string[];
}

export interface CartItem extends ShipmentService {
  quantity: number;
}
