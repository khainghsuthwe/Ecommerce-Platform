// src/middleware/adminMiddleware.ts
import { Request, Response, NextFunction } from 'express';

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' }); // Only admins can access
    }
    next();
};

export default adminMiddleware;
