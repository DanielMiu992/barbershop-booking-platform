import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extindem interfața Request din Express pentru a recunoaște proprietatea user
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}


export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const JWT_SECRET = process.env.JWT_SECRET as string; // checked at startup in server.ts

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrage string-ul de după "Bearer "

  // console.log('Authorization Header:', authHeader); // Log pentru debugging
  // console.log('Token primit în middleware:', token); // Log pentru debugging
  // console.log('Request Headers:', req.headers);

  if (!token) {
    res.status(401).json({ error: 'Acces refuzat. Token lipsă.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Token invalid sau expirat.' });
      return;
    }
    console.log('User decoded from token:', decoded); // Log pentru debugging
    req.user = decoded as { userId: number; role: string };
    next();
  });
};