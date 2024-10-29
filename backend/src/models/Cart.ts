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
    userId: string;
    products: { productId: IProduct | string; quantity: number }[]; // Allow both types
}

const cartSchema: Schema = new Schema({
    userId: { type: String, required: true },
    products: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
    }],
});

export default mongoose.model<ICart>('Cart', cartSchema);
