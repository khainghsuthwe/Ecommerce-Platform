import mongoose from 'mongoose';
import { Request, Response } from 'express';
import supertest from 'supertest';
import Cart from '../../src/models/Cart';
import Product from '../../src/models/Product';
import User from '../../src/models/User';
import { addToCart, removeFromCart, viewCart } from '../../src/controllers/cartController';
import app from '../../src/app'; // Assuming your Express app is exported from app.ts

describe('Cart Controller', () => {
    beforeAll(async () => {
        // Connect to MongoDB Memory Server (handled by jest-mongodb)
        await mongoose.connect(process.env.MONGO_URL!);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    afterEach(async () => {
        await Cart.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});
    });

    describe('addToCart', () => {
        it('should add a product to a new cart', async () => {
            // Create a user
            const user = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
                role: 'user',
            });

            // Create a product
            const product = await Product.create({
                name: 'Test Product',
                description: 'A test product',
                price: 10,
                inventory: 100,
                category: new mongoose.Types.ObjectId(),
            });

            const req = {
                body: {
                    usr: user.id.toString(),
                    productId: product.id.toString(),
                    quantity: 2,
                },
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await addToCart(req, res);

            expect(res.status).not.toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Product added to cart successfully',
                    cart: expect.any(Object),
                })
            );

            const cart = await Cart.findOne({ usr: user._id });
            expect(cart).toBeTruthy();
            expect(cart!.products).toHaveLength(1);
            expect(cart!.products[0].productId.toString()).toBe(product.id.toString());
            expect(cart!.products[0].quantity).toBe(2);

            const updatedProduct = await Product.findById(product._id);
            expect(updatedProduct!.inventory).toBe(98); // Inventory reduced by 2
        });

        it('should return 400 if product is not found', async () => {
            const user = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
                role: 'user',
            });

            const req = {
                body: {
                    usr: user.id.toString(),
                    productId: new mongoose.Types.ObjectId().toString(),
                    quantity: 1,
                },
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await addToCart(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
        });

        it('should return 400 if quantity exceeds inventory', async () => {
            const user = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
                role: 'user',
            });

            const product = await Product.create({
                name: 'Test Product',
                description: 'A test product',
                price: 10,
                inventory: 5,
                category: new mongoose.Types.ObjectId(),
            });

            const req = {
                body: {
                    usr: user.id.toString(),
                    productId: product.id.toString(),
                    quantity: 10,
                },
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await addToCart(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not enough stock available' });
        });
    });

    describe('removeFromCart', () => {
        it('should remove a product from the cart', async () => {
            const user = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
                role: 'user',
            });

            const product = await Product.create({
                name: 'Test Product',
                description: 'A test product',
                price: 10,
                inventory: 100,
                category: new mongoose.Types.ObjectId(),
            });

            const cart = await Cart.create({
                usr: user._id,
                products: [{ productId: product._id, quantity: 2 }],
            });

            const req = {
                body: { usr: user.id.toString() },
                params: { productId: product.id.toString() },
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await removeFromCart(req, res);

            expect(res.status).not.toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Product removed from cart successfully' });

            const updatedCart = await Cart.findById(cart._id);
            expect(updatedCart!.products).toHaveLength(0);
        });

        it('should return 404 if cart is not found', async () => {
            const req = {
                body: { usr: new mongoose.Types.ObjectId().toString() },
                params: { productId: new mongoose.Types.ObjectId().toString() },
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await removeFromCart(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Cart not found' });
        });
    });

    describe('viewCart', () => {
        it('should retrieve the user’s cart with populated products', async () => {
            const user = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
                role: 'user',
            });

            const product = await Product.create({
                name: 'Test Product',
                description: 'A test product',
                price: 10,
                inventory: 100,
                category: new mongoose.Types.ObjectId(),
            });

            await Cart.create({
                usr: user._id,
                products: [{ productId: product._id, quantity: 2 }],
            });

            const req = {
                body: { usr: user.id.toString() },
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await viewCart(req, res);

            expect(res.status).not.toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    usr: user._id,
                    products: expect.arrayContaining([
                        expect.objectContaining({
                            productId: expect.objectContaining({
                                _id: product._id,
                                name: 'Test Product',
                                price: 10,
                            }),
                            quantity: 2,
                        }),
                    ]),
                })
            );
        });

        it('should return 404 if cart is not found', async () => {
            const req = {
                body: { usr: new mongoose.Types.ObjectId().toString() },
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await viewCart(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Cart not found' });
        });
    });

    // Example of testing an endpoint with Supertest
    describe('POST /cart/add', () => {
        it('should add a product to cart via API', async () => {
            const user = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
                role: 'user',
            });

            const product = await Product.create({
                name: 'Test Product',
                description: 'A test product',
                price: 10,
                inventory: 100,
                category: new mongoose.Types.ObjectId(),
            });

            const response = await supertest(app)
                .post('/cart/add')
                .send({
                    usr: user.id.toString(),
                    productId: product.id.toString(),
                    quantity: 2,
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Product added to cart successfully',
                    cart: expect.any(Object),
                })
            );
        });
    });
});