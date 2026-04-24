import { BaseService } from './baseService';
import { ShipmentStatus } from '../types';

export interface PricingEstimate {
  baseRate: number;
  weight: number;
  distance: number;
  serviceType: string;
  totalCost: number;
  currency: string;
  estimatedETA: number;
}

export class ShipmentApiService extends BaseService {
  static async updateStatus(shipmentId: string, status: ShipmentStatus, exceptionNote?: string) {
    return this.request<{ success: boolean; status: string }>('/shipments/update-status', {
      method: 'POST',
      body: JSON.stringify({ shipmentId, status, exceptionNote }),
    });
  }

  static async getEstimate(weight: number, distance: number, serviceType: string) {
    return this.request<PricingEstimate>('/shipments/estimate', {
      method: 'POST',
      body: JSON.stringify({ weight, distance, serviceType }),
    });
  }
}
