// src/routes/cartRoutes.ts
import { Router } from 'express';
import { addToCart, removeFromCart, viewCart } from '../controllers/cartController';
//import { checkout } from '../controllers/paymentController';
import authMiddleware from '../middlewares/authMiddleware'; // Import auth middleware

const router = Router();

// Apply auth middleware to the cart routes
router.use(authMiddleware); // This will protect all routes below

router.post('/add', addToCart);
router.delete('/remove/:productId', removeFromCart);
router.get('/view', viewCart);
//router.post('/checkout', checkout); // Use the checkout function from the payment controller

export default router;
