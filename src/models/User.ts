import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from './Product'; // Import IProduct

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    favourites: mongoose.Types.ObjectId[]; // Array of ObjectIds referencing products
}

const userSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    favourites: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' // Reference to the Product model
    }],
});

export default mongoose.model<IUser>('User', userSchema);
