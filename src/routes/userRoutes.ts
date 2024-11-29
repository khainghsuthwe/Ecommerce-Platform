import { Router } from 'express';
import { signup, login } from '../controllers/userController';
import { updateProfile, addToFavourites, removeFromFavourites, getFavouriteProducts } from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';
const router = Router();

router.post('/signup', signup);
router.post('/login',login);
router.put('/api/user/updateprofile', authMiddleware, updateProfile);
router.post('/api/user/addFavourite', authMiddleware, addToFavourites);

router.delete('/api/user/removeFavourite', authMiddleware, removeFromFavourites);
router.get('/api/user/favourites', authMiddleware, getFavouriteProducts);


export default router;
