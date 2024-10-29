// import mongoose, { Document, Schema } from 'mongoose';

// export interface IProduct extends Document {
//     name: string;
//     price: number;
//     inventory: number;
// }

// const productSchema: Schema = new Schema({
//     name: { type: String, required: true },
//     price: { type: Number, required: true },
//     inventory: { type: Number, required: true },
// });

// export default mongoose.model<IProduct>('Product', productSchema);

// src/models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    inventory: number;
    category: mongoose.Types.ObjectId; // Assuming you're linking to categories
}

const productSchema: Schema<IProduct> = new Schema({
    name: { type: String, required: true }, // Correctly formatted
    description: { type: String, required: true },
    price: { type: Number, required: true },
    inventory: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Ensure ObjectId reference is correct
}, { timestamps: true });

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
