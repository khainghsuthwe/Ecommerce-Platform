// src/routes/cartRoutes.ts
import { Router } from 'express';
import { addToCart, removeFromCart, viewCart } from '../controllers/cartController';
import authMiddleware from '../middlewares/authMiddleware'; 

const router = Router();

router.use(authMiddleware); 

router.post('/add', addToCart);
router.delete('/remove/:productId', removeFromCart);
router.get('/view', viewCart);

export default router;
