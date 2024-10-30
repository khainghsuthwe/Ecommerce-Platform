import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import categoryRoutes from './routes/categoryRoutes'
import  authMiddleware  from './middlewares/authMiddleware';

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || '')
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

//health-check
app.get('/',(req,res) =>{
    res.json({message:`Hello. server running on port: ${PORT}`})
})

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',  cartRoutes);
app.use('/api/categories', categoryRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
