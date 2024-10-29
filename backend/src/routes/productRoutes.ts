// src/routes/productRoutes.ts
import { Router } from 'express';
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from '../controllers/productController';
import authMiddleware from '../middlewares/authMiddleware';
import adminMiddleware from '../middlewares/adminMiddleware'; // Import admin middleware

const router = Router();

// Routes that anyone can access
router.get('/', getProducts);        // Get all products (no login required)
router.get('/:id', getProductById);  // Get a single product by ID (no login required)

// Protect the following routes with authentication and admin checks
router.use(authMiddleware);           // Only authenticated users can access these routes

router.post('/', adminMiddleware, createProduct); // Only admin can create product
router.put('/:id', adminMiddleware, updateProduct); // Only admin can update product
router.delete('/:id', adminMiddleware, deleteProduct); // Only admin can delete product

export default router;
