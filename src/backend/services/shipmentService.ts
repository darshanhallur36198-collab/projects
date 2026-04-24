import { getAdmin } from '../../lib/firebase-admin';
import { ShipmentStatus } from '../../types';

export class ShipmentService {
  private static getAdminApp() {
    return getAdmin();
  }

  static async updateStatus(shipmentId: string, status: ShipmentStatus, exceptionNote?: string) {
    const adminApp = this.getAdminApp();
    const firestore = adminApp.firestore();

    const shipmentRef = firestore.collection('shipments').doc(shipmentId);
    const shipmentDoc = await shipmentRef.get();

    if (!shipmentDoc.exists) {
      throw new Error('Shipment not found');
    }

    const shipmentData = shipmentDoc.data();
    const userId = shipmentData?.userId;

    // Update Firestore
    await shipmentRef.update({
      status,
      updatedAt: new Date().toISOString(),
      ...(exceptionNote ? { 
        exceptionDetails: { 
          reason: exceptionNote, 
          code: 'EXC_001', 
          resolutionSteps: ['Contact Support'] 
        } 
      } : {})
    });

    // Notify User via FCM
    if (userId) {
      const userDoc = await firestore.collection('users').doc(userId).get();
      const fcmTokens = userDoc.data()?.fcmTokens || [];

      if (fcmTokens.length > 0) {
        const messages = fcmTokens.map((token: string) => ({
          token,
          notification: {
            title: `Shipment Update: ${status.replace('_', ' ').toUpperCase()}`,
            body: `Your parcel ${shipmentData?.trackingNumber} is now ${status.replace('_', ' ')}.`,
          },
          data: {
            shipmentId: shipmentId,
            trackingNumber: shipmentData?.trackingNumber
          }
        }));

        await Promise.all(messages.map((m: any) => adminApp.messaging().send(m)));
      }
    }

    return { success: true, status };
  }

  static calculatePricing(weight: number, distance: number, serviceType: string) {
    const baseRates: Record<string, number> = {
      'express': 15,
      'standard': 8,
      'cargo': 5
    };

    const rate = baseRates[serviceType.toLowerCase()] || 10;
    const distanceFactor = Math.ceil(distance / 50); // Every 50km
    const weightFactor = Math.ceil(weight / 5);     // Every 5kg

    const total = rate * distanceFactor * weightFactor;
    
    return {
      baseRate: rate,
      weight,
      distance,
      serviceType,
      totalCost: parseFloat(total.toFixed(2)),
      currency: 'USD',
      estimatedETA: Math.ceil(distance / 60) + 1 // hours
    };
  }
}
