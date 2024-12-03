// src/controllers/paymentController.ts
import { Request, Response } from 'express';
import stripe from '../config/stripe';
import { IProduct } from '../models/Product';
import Cart from '../models/Cart';
import Payment from '../models/Payment'; 
import Product from '../models/Product';


export const checkout = async (req: Request, res: Response) => {
  const { userId, cartItems } = req.body;  

  if (!userId || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'User ID and cart items are required' });
  }

  try {

    let cart = await Cart.findOne({ userId: userId })
    .populate('products.productId', 'name price description')  
    .exec();

    if (!cart) {
      cart = new Cart({
        userId: userId,  
        products: cartItems.map((item: any) => ({
          productId: item.id,  
          quantity: item.quantity,
        })),
      });
      await cart.save();
      cart = await Cart.findOne({ userId: userId })
        .populate('products.productId', 'name price description')
        .exec();
    } 
   

    if (!cart || !cart.products) {
      return res.status(400).json({ message: 'Cart not found or cart is empty' });
    }
    const lineItems = cart.products.map((item: any) => {
      const product = item.productId; 
      if (!product) {
        throw new Error('Product details are missing or invalid.');
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description || 'No description available',
          },
          unit_amount: Math.round(product.price * 100) , 
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    const amount = cart.products.reduce((total: number, item: any) => {
      const price = item.productId.price;
      const quantity = item.quantity;

      if (isNaN(price) || isNaN(quantity)) {
        console.warn('Invalid price or quantity:', item);
        return total;
      }

      return total + price * quantity;
    }, 0);

    // Make sure amount is a valid number before saving it
    if (isNaN(amount)) {
      return res.status(400).json({ message: 'Invalid total amount' });
    }

    const payment = new Payment({
      userId,
      amount,
      currency: 'usd',
      status: 'pending',
      transactionId: session.id,
    });

    await payment.save();


    //await Cart.updateOne({ userId: userId }, { $set: { products: [] } });

    res.json({ url: session.url });
  } catch (err: unknown) {
    const errorMessage = (err instanceof Error) ? err.message : 'Error during checkout';
    console.error(err);
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
