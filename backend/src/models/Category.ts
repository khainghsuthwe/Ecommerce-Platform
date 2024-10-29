// src/models/Category.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    description?: string;
}

const categorySchema: Schema<ICategory> = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
}, { timestamps: true });

const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
