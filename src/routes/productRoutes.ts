// src/routes/productRoutes.ts
import { Router } from 'express';
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateInventory,
    getProductsByCategory,
    getPopularProducts,
    getFeaturedProducts
} from '../controllers/productController';
import authMiddleware from '../middlewares/authMiddleware';
import adminMiddleware from '../middlewares/adminMiddleware'; // Import admin middleware

const router = Router();

// Routes that anyone can access
router.get('/', getProducts);       
router.get('/:id', getProductById); 
router.get('/products/category', getProductsByCategory);
router.get('/products/popular', getPopularProducts);
router.get('/products/featured', getFeaturedProducts);
// Protect the following routes with authentication and admin checks
router.use(authMiddleware);           // Only authenticated users can access these routes

router.post('/', adminMiddleware, createProduct); // Only admin can create product
router.put('/:id', adminMiddleware, updateProduct); // Only admin can update product
router.delete('/:id', adminMiddleware, deleteProduct); // Only admin can delete product
router.put('/inventory/:id', adminMiddleware, updateInventory);
export default router;
