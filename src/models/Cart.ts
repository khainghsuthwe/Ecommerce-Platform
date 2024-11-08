// import mongoose, { Document, Schema } from 'mongoose';

// interface ICart extends Document {
//     userId: string;
//     products: { productId: string; quantity: number }[];
// }

// const cartSchema: Schema = new Schema({
//     userId: { type: String, required: true },
//     products: [{ productId: { type: String, required: true }, quantity: { type: Number, required: true } }],
// });


// export default mongoose.model<ICart>('Cart', cartSchema);


import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from './Product'; // Import IProduct

interface ICart extends Document {
    usr: mongoose.Types.ObjectId; // Change userId to usr and use ObjectId
    products: { productId: IProduct | mongoose.Types.ObjectId; quantity: number }[]; // Use ObjectId for productId
}

const cartSchema: Schema = new Schema({
    usr: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference User model
    products: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference Product model
        quantity: { type: Number, required: true, min: 1 } // Ensure quantity is at least 1
    }],
});

export default mongoose.model<ICart>('Cart', cartSchema);

