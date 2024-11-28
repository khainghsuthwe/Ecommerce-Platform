import { Router } from 'express';
import { signup, login } from '../controllers/userController';
import { updateProfile } from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';
const router = Router();

router.post('/signup', signup);
router.post('/login',login);
router.put('/api/users/profile', authMiddleware, updateProfile);

export default router;
