import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorMiddleware';
import { getAdmin } from '../../lib/firebase-admin';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No authorization token provided', 401));
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await getAdmin().auth().verifyIdToken(token);
    
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    next(new AppError('Unauthorized access', 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const userDoc = await getAdmin().firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      
      const userRole = userData?.role || 'user'; // Default to user if no role exists

      if (!roles.includes(userRole)) {
        return next(new AppError('You do not have permission to perform this action', 403));
      }
      
      next();
    } catch (error) {
      next(new AppError('Permission verification failure', 500));
    }
  };
};
