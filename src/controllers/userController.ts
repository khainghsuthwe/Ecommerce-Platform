import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User'; // Import the User model

export const signup = async (req: Request, res: Response) => {
    const { username, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username, // Include username in the new user object
            email,
            password: hashedPassword,
            role: role || 'user'
        });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || '', { expiresIn: '1h' });

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role }
        });
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error creating user';
        res.status(500).json({ message: errorMessage });
    }
};

export const login = async (req: Request, res: Response) => {
    const {username, email, password } = req.body;

    try {
        const user: IUser | null = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
            return res.json({
                token,
                user: { id: user._id, username: user.username, email: user.email, role: user.role } // Include username in the response
            });
        }
        res.status(401).json({ message: 'Invalid credentials' });
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Server error';
        res.status(500).json({ message: errorMessage });
    }
};


export const updateProfile = async (req: Request, res: Response) => {
    const userId = req.user?.id; // Access the user ID from the JWT payload
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }
  
    const { username, password } = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (username) {
        user.username = username;
      }
  
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }
  
      await user.save();
  
      res.json({
        message: 'Profile updated successfully',
        user: { id: user._id, username: user.username, email: user.email, role: user.role }
      });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error updating profile';
      res.status(500).json({ message: errorMessage });
    }
  };