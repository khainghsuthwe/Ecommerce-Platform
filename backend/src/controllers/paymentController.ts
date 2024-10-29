// src/controllers/paymentController.ts
import { Request, Response } from 'express';
import stripe from '../config/stripe';
import { IProduct } from '../models/Product';
import Cart from '../models/Cart';
import Payment from '../models/Payment'; // Import the Payment model

export const checkout = async (req: Request, res: Response) => {
    const { userId } = req.body;

    try {
        const cart = await Cart.findOne({ userId }).populate('products.productId');
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const line_items = cart.products.map(item => {
            const product = item.productId as IProduct; // Type assertion here

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                    },
                    unit_amount: product.price * 100, // Amount in cents
                },
                quantity: item.quantity,
            };
        });

        // Create a Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });

        // Save payment details in the database
        const payment = new Payment({
            userId,
            amount: cart.products.reduce((total, item) => {
                const product = item.productId as IProduct;
                return total + product.price * item.quantity;
            }, 0),
            currency: 'usd',
            status: 'pending',
            transactionId: session.id, // Store Stripe session ID as transaction ID
        });

        await payment.save();

        // Return the checkout session URL
        res.json({ url: session.url });
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error during checkout';
        res.status(500).json({ message: errorMessage });
    }
};
