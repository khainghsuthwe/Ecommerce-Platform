import { Request, Response } from 'express';
import Cart from '../models/Cart';
import stripe from '../config/stripe';
import { IProduct } from '../models/Product';

export const addToCart = async (req: Request, res: Response) => {
    const { userId, productId, quantity } = req.body;

    try {
        const cart = await Cart.findOne({ userId }) || new Cart({ userId, products: [] });
        const existingProduct = cart.products.find(p => p.productId === productId);

        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.products.push({ productId, quantity });
        }

        await cart.save();
        res.json({ message: 'Product added to cart successfully' });
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error adding to cart';
        res.status(500).json({ message: errorMessage });
    }
};

export const removeFromCart = async (req: Request, res: Response) => {
    const { userId } = req.body;
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.products = cart.products.filter(p => p.productId !== productId);
        await cart.save();
        res.json({ message: 'Product removed from cart successfully' });
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error removing from cart';
        res.status(500).json({ message: errorMessage });
    }
};

export const viewCart = async (req: Request, res: Response) => {
    const { userId } = req.body;

    try {
        const cart = await Cart.findOne({ userId }).populate('products.productId');
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        res.json(cart);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error retrieving cart';
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
