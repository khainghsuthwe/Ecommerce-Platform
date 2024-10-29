// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//     const token = req.headers['authorization']?.split(' ')[1];
//     if (!token) return res.sendStatus(401);

//     jwt.verify(token, process.env.JWT_SECRET || '', (err) => {
//         if (err) return res.sendStatus(403);
//         next();
//     });
// };

// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || '');
        req.user = decoded; // Now TypeScript recognizes req.user
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

export default authMiddleware;
