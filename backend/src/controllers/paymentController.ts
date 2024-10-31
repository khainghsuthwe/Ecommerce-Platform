// src/controllers/paymentController.ts
import { Request, Response } from 'express';
import stripe from '../config/stripe';
import { IProduct } from '../models/Product';
import Cart from '../models/Cart';
import Payment from '../models/Payment'; // Import the Payment model

// Function to handle checkout using Stripe Checkout sessions
export const checkout = async (req: Request, res: Response) => {
    const { userId } = req.body;

    // Validate userId
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        // Fetch the user's cart
        const cart = await Cart.findOne({ userId }).populate('products.productId');
        if (!cart || cart.products.length === 0) {
            return res.status(404).json({ message: 'Cart not found or empty' });
        }

        // Prepare line items for Stripe
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
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
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

// Function to create a direct payment intent with Stripe
export const createPayment = async (req: Request, res: Response) => {
    const { userId, cartItems } = req.body;

    // Validate input
    if (!userId || !cartItems) {
        return res.status(400).json({ message: 'User ID and cart items are required' });
    }

    try {
        // Calculate total amount from cart items
        const totalAmount = cartItems.reduce((total: number, item: { price: number; quantity: number }) => {
            return total + item.price * item.quantity;
        }, 0);

        // Create a Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount, // amount in cents
            currency: 'usd',
            metadata: { userId: userId.toString() },
        });

        // Save payment details in the database
        const payment = new Payment({
            userId,
            amount: totalAmount,
            currency: 'usd',
            status: 'pending', // Set initial status
            transactionId: paymentIntent.id, // Store Stripe Payment Intent ID
        });

        await payment.save();

        // Respond with the client secret to complete the payment on the client side
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error creating payment';
        res.status(500).json({ message: errorMessage });
    }
};

// Function to confirm payment status after returning from Stripe
export const confirmPayment = async (req: Request, res: Response) => {
    const { transactionId } = req.body; // Get transaction ID from request

    try {
        const payment = await Payment.findOne({ transactionId });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Update payment status based on your verification logic
        // For simplicity, assume the payment was successful
        payment.status = 'completed'; // Update the status appropriately
        await payment.save();

        return res.json(payment);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error confirming payment';
        res.status(500).json({ message: errorMessage });
    }
};
