import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// export const signup = async (req: Request, res: Response) => {
//     const { email, password } = req.body;

//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new User({ email, password: hashedPassword });
//         await newUser.save();
//         res.status(201).json({ message: 'User created successfully' });
//     } catch (err: unknown) {
//         const errorMessage = (err instanceof Error) ? err.message : 'Error creating user';
//         res.status(400).json({ message: errorMessage });
//     }
// };

export const signup = async (req: Request, res: Response) => {
    const { email, password, role } = req.body; // Accept role from request body

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashedPassword,
            role: role || 'user' // Default to 'user' if no role is provided
        });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || '', { expiresIn: '1h' });

        res.status(201).json({ message: 'User created successfully', token });
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error creating user';
        res.status(400).json({ message: errorMessage });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
            return res.json({ token });
        }
        res.status(401).json({ message: 'Invalid credentials' });
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Server error';
        res.status(500).json({ message: errorMessage });
    }
};
