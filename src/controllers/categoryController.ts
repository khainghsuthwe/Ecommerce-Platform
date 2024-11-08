// src/controllers/categoryController.ts
import { Request, Response } from 'express';
import Category from '../models/Category';

export const createCategory = async (req: Request, res: Response): Promise<Response> => {
    const { name, description } = req.body;

    try {
        const newCategory = new Category({ name, description });
        await newCategory.save();
        return res.status(201).json(newCategory);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error creating category';
        return res.status(400).json({ message: errorMessage });
    }
};

export const getCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
        const categories = await Category.find();
        return res.json(categories);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error fetching categories';
        return res.status(500).json({ message: errorMessage });
    }
};

export const getCategoryById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.json(category);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error fetching category';
        return res.status(500).json({ message: errorMessage });
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.json(category);
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error updating category';
        return res.status(500).json({ message: errorMessage });
    }
};

export const deleteCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.status(204).send();
    } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'Error deleting category';
        return res.status(500).json({ message: errorMessage });
    }
};
