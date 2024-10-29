// src/config/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-09-30.acacia', // Use an appropriate API version
});

export default stripe;
