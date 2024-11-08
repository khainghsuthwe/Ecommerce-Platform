// import { Request, Response } from 'express';
// import Product from '../models/Product';

// export const createProduct = async (req: Request, res: Response) => {
//     const { name, price, inventory } = req.body;

//     try {
//         const newProduct = new Product({ name, price, inventory });
//         await newProduct.save();
//         res.status(201).json({ message: 'Product created successfully' });
//     } catch (err: unknown) {
//         const errorMessage = (err instanceof Error) ? err.message : 'Error creating product';
//         res.status(400).json({ message: errorMessage });
//     }
// };

// export const getProducts = async (req: Request, res: Response) => {
//     try {
//         const products = await Product.find();
//         res.json(products);
//     } catch (err: unknown) {
//         const errorMessage = (err instanceof Error) ? err.message : 'Server error';
//         res.status(500).json({ message: errorMessage });
//     }
// };


// src/controllers/productController.ts
import { Request, Response } from 'express';
import Product from '../models/Product';

export const createProduct = async (req: Request, res: Response): Promise<Response> => {
    const { name, description, price, inventory, category } = req.body;

    try {
        const newProduct = new Product({ name, description, price, inventory, category });
        await newProduct.save();
        return res.status(201).json(newProduct);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error creating product';
        return res.status(400).json({ message: errorMessage });
    }
};

export const getProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { search, category, minPrice, maxPrice } = req.query;

        // Build query object
        const query: any = {};

        // Add search functionality
        if (search) {
            query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        // Filter by category if provided
        if (category) {
            query.category = category;
        }

        // Filter by price range if provided
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(query).populate('category'); // Populate category details
        return res.json(products);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error fetching products';
        return res.status(500).json({ message: errorMessage });
    }
};

export const getProductsByCategory = async (req: Request, res: Response): Promise<Response> => {
    const { category } = req.query;

    try {
        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        const products = await Product.find({ category });
        
        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found in this category' });
        }

        return res.json(products);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error fetching products';
        return res.status(500).json({ message: errorMessage });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.json(product);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error fetching product';
        return res.status(500).json({ message: errorMessage });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.json(product);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error updating product';
        return res.status(500).json({ message: errorMessage });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(204).send();
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error deleting product';
        return res.status(500).json({ message: errorMessage });
    }
};

export const updateInventory = async (req: Request, res: Response) => {
    const { id } = req.params; // Product ID from the request parameters
    const { inventory } = req.body; // New inventory count from the request body

    if (typeof inventory !== 'number' || inventory < 0) {
        return res.status(400).json({ message: 'Invalid inventory value' });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { inventory },
            { new: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Server error';
        res.status(500).json({ message: errorMessage });
    }
};
