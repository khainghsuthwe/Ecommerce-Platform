// // src/routes/categoryRoutes.ts
// import { Router } from 'express';
// import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/categoryController';

// const router = Router();

// router.post('/', createCategory);
// router.get('/', getCategories);
// router.get('/:id', getCategoryById);
// router.put('/:id', updateCategory);
// router.delete('/:id', deleteCategory);

// export default router;


// src/routes/categoryRoutes.ts
import { Router } from 'express';
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController';
import authMiddleware from '../middlewares/authMiddleware'; // Import auth middleware
import adminMiddleware from '../middlewares/adminMiddleware'; // Import admin middleware

const router = Router();

// Anyone can view categories
router.get('/', getCategories); // Get all categories
router.get('/:id', getCategoryById); // Get a single category by ID
// Protect these routes with authentication middleware
router.use(authMiddleware); 

// Apply admin middleware to routes that require admin access
router.post('/', adminMiddleware, createCategory); // Only admin can create a category
router.put('/:id', adminMiddleware, updateCategory); // Only admin can update a category
router.delete('/:id', adminMiddleware, deleteCategory); // Only admin can delete a category



export default router;
