import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User'; 
import Product from '../models/Product'; 

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


// Add a product to the user's favourites
export const addToFavourites = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { productId } = req.body;

  if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
  }

  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Check if the product exists
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }

      // Add the product to the user's favourites if not already added
      if (!user.favourites.includes(productId)) {
          user.favourites.push(productId);
          await user.save();
          return res.status(200).json({ message: 'Product added to favourites' });
      }

      res.status(400).json({ message: 'Product already in favourites' });
  } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error adding product to favourites';
      res.status(500).json({ message: errorMessage });
  }
};

// Remove a product from the user's favourites
export const removeFromFavourites = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { productId } = req.body;

  if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
  }

  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Check if the product is in the user's favourites
      if (!user.favourites.includes(productId)) {
          return res.status(400).json({ message: 'Product not in favourites' });
      }

      // Remove the product from the favourites
      user.favourites = user.favourites.filter(id => !id.equals(productId));
      await user.save();
      res.status(200).json({ message: 'Product removed from favourites' });
  } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error removing product from favourites';
      res.status(500).json({ message: errorMessage });
  }
};

// Get the user's favourite products
export const getFavouriteProducts = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
  }

  try {
      const user = await User.findById(userId).populate('favourites');
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ favourites: user.favourites });
  } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error fetching favourite products';
      res.status(500).json({ message: errorMessage });
  }
};