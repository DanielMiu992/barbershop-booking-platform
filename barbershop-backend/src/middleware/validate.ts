import { Request, Response, NextFunction } from 'express';
import { z, ZodType  } from 'zod';
import { deleteAvatarFile } from '../config/upload';

export const validate = (schema: ZodType<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      console.log("req.body == || validate middleware ||==", req.body)

      const validation = await schema.safeParseAsync(req.body);

      console.log("==|| VALIDATION ZOD ||== middleware == ", validation)
      
      if (!validation.success) {
        res.status(400).json({
          data: null,
          success: false,
          message: 'Datele trimise sunt invalide',
          errors: z.treeifyError(validation.error) 
        });
        return;
      }

      req.body = validation.data;

      next();
    } catch (error) {
      console.error('Eroare internă în middleware-ul de validare:', error);
      res.status(500).json({ data: null, success: false, message: 'Eroare internă de server' });
    }
  };
};


export const validateQuery = (schema: ZodType<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {


      // console.log("validateQuery == || req.query ||==", req.query);

      const validation = await schema.safeParseAsync(req.query);

      // console.log("==|| validateQuery ZOD ||==", validation)

      if (!validation.success) {
        res.status(400).json({
          data: null,
          success: false,
          message: 'Parametrii trimiși sunt invalizi',
          errors: z.treeifyError(validation.error),
        });
        return;
      }

      // req.query e readonly în Express 5 — punem rezultatul pe o proprietate proprie
      (req as any).validatedQuery = validation.data;

      next();
    } catch (error) {
      console.error('Eroare internă în middleware-ul de validare:', error);
      res.status(500).json({ data: null, success: false, message: 'Eroare internă de server' });
    }
  };
};


export const validateFile = (schema: ZodType<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Niciun fișier primit',
        });
        return;
      }

      const validation = await schema.safeParseAsync(req.file);

      if (!validation.success) {
        // Fișierul e deja pe disc — îl ștergem, altfel rămâne orfan
        deleteAvatarFile(`/uploads/avatars/${req.file.filename}`);

        res.status(400).json({
          success: false,
          message: 'Fișierul trimis este invalid',
          errors: z.treeifyError(validation.error),
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Eroare internă în middleware-ul de validare fișier:', error);
      res.status(500).json({ success: false, message: 'Eroare internă de server' });
    }
  };
};