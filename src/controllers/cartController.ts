import mongoose from 'mongoose'; // Import mongoose for ObjectId
import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';

// export const addToCart = async (req: Request, res: Response) => {
//     const { usr, productId, quantity } = req.body;

//     try {
//         const cart = await Cart.findOne({ usr }) || new Cart({ usr, products: [] });
//         const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === productId);

//         if (existingProductIndex > -1) {
//             cart.products[existingProductIndex].quantity += quantity;
//         } else {
//             cart.products.push({ productId: new mongoose.Types.ObjectId(productId), quantity }); // Instantiate ObjectId
//         }

//         await cart.save();
//         res.json({ message: 'Product added to cart successfully' });
//     } catch (err: unknown) {
//         const errorMessage = (err instanceof Error) ? `Error adding to cart: ${err.message}` : 'Error adding to cart';
//         res.status(500).json({ message: errorMessage });
//     }
// };

export const addToCart = async (req: Request, res: Response) => {
    const { usr, productId, quantity } = req.body;

    // Validate incoming data
    if (!usr || !productId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid data. Please provide user ID, product ID, and quantity greater than 0.' });
    }

    try {
        // Find the product by ID and check stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.inventory < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        // Find the user's cart or create a new one if not exists
        const cart = await Cart.findOne({ usr }) || new Cart({ usr, products: [] });

        // Check if the product already exists in the cart
        const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === productId);

        if (existingProductIndex > -1) {
            // If the product is already in the cart, increase the quantity
            const currentProduct = cart.products[existingProductIndex];
            const newQuantity = currentProduct.quantity + quantity;

            // Ensure that the total quantity does not exceed available inventory
            if (newQuantity > product.inventory) {
                return res.status(400).json({ message: 'Not enough stock available for the updated quantity' });
            }

            // Update the quantity of the existing product
            cart.products[existingProductIndex].quantity = newQuantity;
        } else {
            // Add the product to the cart with the specified quantity
            cart.products.push({ productId: new mongoose.Types.ObjectId(productId), quantity });
        }

        // Save the updated cart
        await cart.save();

        // Update product inventory
        product.inventory -= quantity;
        await product.save();

        // Respond to the client with the updated cart
        res.json({ message: 'Product added to cart successfully', cart });
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? `Error adding to cart: ${err.message}` : 'Error adding to cart';
        res.status(500).json({ message: errorMessage });
    }
};


export const removeFromCart = async (req: Request, res: Response) => {
    const { usr } = req.body;
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ usr });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const initialLength = cart.products.length;
        cart.products = cart.products.filter(p => p.productId.toString() !== productId);

        if (cart.products.length === initialLength) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        await cart.save();
        res.json({ message: 'Product removed from cart successfully' });
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? `Error removing from cart: ${err.message}` : 'Error removing from cart';
        res.status(500).json({ message: errorMessage });
    }
};


export const viewCart = async (req: Request, res: Response) => {
    const { usr } = req.body;

    try {
        const cart = await Cart.findOne({ usr }).populate('products.productId', 'name price');
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        res.json(cart);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? `Error retrieving cart: ${err.message}` : 'Error retrieving cart';
        res.status(500).json({ message: errorMessage });
    }
};

export const removeAllFromCart = async (req: Request, res: Response) => {
    const { usr } = req.body;

    if (!usr) {
        return res.status(400).json({ message: 'Please provide user ID' });
    }

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ usr });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Clear all products from the cart
        cart.products = [];

        // Save the updated cart
        await cart.save();

        // Respond to the client with the updated cart
        res.json({ message: 'All products removed from cart successfully', cart });
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? `Error removing all from cart: ${err.message}` : 'Error removing all from cart';
        res.status(500).json({ message: errorMessage });
    }
};



