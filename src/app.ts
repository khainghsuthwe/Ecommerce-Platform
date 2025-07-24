import express from 'express';
import mongoose from 'mongoose';
import cartRoutes from './routes/cartRoutes'; // example

const app = express();

app.use(express.json());

// Add your routes
app.use('/cart', cartRoutes);

export default app;
