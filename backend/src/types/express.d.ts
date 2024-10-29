// src/types/express.d.ts
import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;  // or the appropriate type for your user ID
                role: string; // or whatever properties you have in the token
                // Add any other user properties you may have
            };
        }
    }
}
