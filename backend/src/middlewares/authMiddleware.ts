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
// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }

//     try {
//         const decoded: any = jwt.verify(token, process.env.JWT_SECRET || '');
//         req.user = decoded; // Now TypeScript recognizes req.user
//         next();
//     } catch (err) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }
// };

// export default authMiddleware;

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
    id: string; 
    role: string; 
}

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: DecodedToken; 
        }
    }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as DecodedToken;
        req.user = decoded; // Attach the decoded user information to the request object
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};

export default authMiddleware;
