import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    inventory: number;
    category: mongoose.Types.ObjectId;
    image?: string;
    tags: ProductTags[]; 
}

// Define the tags enum for product tagging
export enum ProductTags {
    NEW = "new",
    POPULAR = "popular",
    SALE = "sale",
    FEATURED = "featured",
    LIMITED = "limited",
    DISCOUNT = "discount"
}

const productSchema: Schema<IProduct> = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    inventory: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    image: { type: String },
    tags: {
        type: [String], 
        enum: Object.values(ProductTags), // Ensure the tags are valid enum values
        default: [] // Default to an empty array if no tags are provided
    },
}, { timestamps: true });

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
