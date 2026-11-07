import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

type UserRole = 'admin' | 'barber' | 'customer';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const role = req.user?.role as UserRole | undefined;

    if (!role) {
      res.status(401).json({ 
        data: null, 
        success: false, 
        message: 'Neautentificat.' 
      });
      return;
    }

    console.log("==|| role middleware || == required role", role)
    console.log("==|| allowedRoles middleware || == required role", allowedRoles)

    if (!allowedRoles.includes(role)) {
      res.status(403).json({ 
        data: null, 
        success: false, 
        message: 'Acces interzis.' 
      });
      return;
    }

    next();
  };
};