import { Router } from 'express';
import { checkout, createPayment, confirmPayment } from '../controllers/paymentController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware); 
router.post('/checkout', checkout);
router.post('/create-payment', createPayment);
router.post('/confirm-payment', confirmPayment);

export default router;
