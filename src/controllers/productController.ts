

// src/controllers/productController.ts
import { Request, Response } from 'express';
import Product,{ ProductTags } from '../models/Product';

export const createProduct = async (req: Request, res: Response): Promise<Response> => {
    const { name, description, price, inventory, category, image, tags } = req.body;

    try {
        const newProduct = new Product({ name, description, price, inventory, category, image, tags});
        await newProduct.save();
        return res.status(201).json(newProduct);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error creating product';
        return res.status(400).json({ message: errorMessage });
    }
};

// export const getProducts = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const { search, category, minPrice, maxPrice } = req.query;

//         // Build query object
//         const query: any = {};

//         // Add search functionality
//         if (search) {
//             query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
//         }

//         // Filter by category if provided
//         if (category) {
//             query.category = category;
//         }

//         // Filter by price range if provided
//         if (minPrice || maxPrice) {
//             query.price = {};
//             if (minPrice) query.price.$gte = Number(minPrice);
//             if (maxPrice) query.price.$lte = Number(maxPrice);
//         }

//         const products = await Product.find(query).populate('category'); // Populate category details
//         return res.json(products);
//     } catch (err: unknown) {
//         const errorMessage = (err instanceof Error) ? err.message : 'Error fetching products';
//         return res.status(500).json({ message: errorMessage });
//     }
// };

export const getProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

        // Convert page and limit to numbers
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        // Ensure valid page and limit
        if (pageNumber < 1 || limitNumber < 1) {
            return res.status(400).json({ message: 'Invalid pagination parameters' });
        }

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

        // Get the total count of products that match the query (for pagination)
        const totalProducts = await Product.countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalProducts / limitNumber);

        // Get products for the current page, with limit and skip (offset)
        const products = await Product.find(query)
            .skip((pageNumber - 1) * limitNumber)  // Skip the products based on the current page
            .limit(limitNumber)                    // Limit the number of products returned
            .populate('category');                 // Populate category details

        return res.json({
            products,
            totalPages,   // Total pages for pagination
            currentPage: pageNumber,  // Current page number
            totalProducts, // Total number of products matching the query
        });
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


export const getFeaturedProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
       
        // Query products that have the "featured" tag
        const featuredProducts = await Product.find({ tags: ProductTags.FEATURED});
        

        if (featuredProducts.length === 0) {
            return res.status(404).json({ message: 'No featured products found' });
        }

        return res.json(featuredProducts);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error fetching featured products';
        return res.status(500).json({ message: errorMessage });
    }
};

export const getPopularProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Query products that have the "featured" tag
        const popularProducts = await Product.find({ tags: ProductTags.POPULAR })
           

        if (popularProducts.length === 0) {
            return res.status(404).json({ message: 'No popular products found' });
        }

        return res.json(popularProducts);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error fetching popular products';
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
