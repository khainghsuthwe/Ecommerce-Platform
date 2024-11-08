// src/models/Payment.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    transactionId: string; // Stripe transaction ID
    createdAt: Date;
}

const paymentSchema = new Schema<IPayment>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
    transactionId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
