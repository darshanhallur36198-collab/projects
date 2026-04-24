import { Request, Response, NextFunction } from 'express';
import { ShipmentService } from '../services/shipmentService';
import { AppError } from '../middleware/errorMiddleware';

export const updateShipmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shipmentId, status, exceptionNote } = req.body;
    
    if (!shipmentId || !status) {
      return next(new AppError('Missing shipmentId or status', 400));
    }

    const result = await ShipmentService.updateStatus(shipmentId, status, exceptionNote);
    res.json(result);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
};

export const getEstimate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { weight, distance, serviceType } = req.body;
    
    if (!weight || !distance || !serviceType) {
      return next(new AppError('Missing required calculation parameters', 400));
    }

    const estimate = ShipmentService.calculatePricing(
      Number(weight), 
      Number(distance), 
      String(serviceType)
    );
    
    res.json(estimate);
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
};
