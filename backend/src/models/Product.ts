// src/models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    inventory: number;
    category: mongoose.Types.ObjectId; 
    image?: string; 
}

const productSchema: Schema<IProduct> = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true,min: 0 },
    inventory: { type: Number, required: true,min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    image: { type: String }, 
}, { timestamps: true });

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;

