import mongoose from 'mongoose'; // Import mongoose for ObjectId
import { Request, Response } from 'express';
import Cart from '../models/Cart';

export const addToCart = async (req: Request, res: Response) => {
    const { usr, productId, quantity } = req.body;

    try {
        const cart = await Cart.findOne({ usr }) || new Cart({ usr, products: [] });
        const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === productId);

        if (existingProductIndex > -1) {
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            cart.products.push({ productId: new mongoose.Types.ObjectId(productId), quantity }); // Instantiate ObjectId
        }

        await cart.save();
        res.json({ message: 'Product added to cart successfully' });
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


// export const checkout = async (req: Request, res: Response) => {
//     const { userId } = req.body;

//     try {
//         const cart = await Cart.findOne({ userId }).populate('products.productId');
//         if (!cart) return res.status(404).json({ message: 'Cart not found' });

//         const line_items = cart.products.map(item => ({
//             price_data: {
//                 currency: 'usd',
//                 product_data: {
//                     name: item.productId.name,
//                 },
//                 unit_amount: item.productId.price * 100,
//             },
//             quantity: item.quantity,
//         }));

//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items,
//             mode: 'payment',
//             success_url: `${process.env.FRONTEND_URL}/success`,
//             cancel_url: `${process.env.FRONTEND_URL}/cancel`,
//         });

//         res.json({ url: session.url });
//     } catch (err: unknown) {
//         const errorMessage = (err instanceof Error) ? err.message : 'Error during checkout';
//         res.status(500).json({ message: errorMessage });
//     }
// };
