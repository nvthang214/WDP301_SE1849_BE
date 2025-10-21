import { MESSAGE } from '../constants/message.js';
import ErrorResponse from '../lib/helper/ErrorResponse.js';
import { toResultOk } from '../results/Result.js';
import Category from '../models/Category.js';

// Get all categories
export const getAllCategories = async (req, res) => {
    const categories = await Category.find();
    res.json(toResultOk({ msg: MESSAGE.CATEGORY_FETCH_SUCCESS, data: categories }));
}

// Create new category
export const createCategory = async (req, res) => {
    const { name, description } = req.body;
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.json(toResultOk({ msg: MESSAGE.CATEGORY_CREATE_SUCCESS, data: newCategory }));
}

// Update category by id
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(id, { name, description }, { new: true });
    if (!updatedCategory) {
        throw new ErrorResponse(MESSAGE.CATEGORY_NOT_FOUND, 404);
    }
    res.json(toResultOk({ msg: MESSAGE.CATEGORY_UPDATE_SUCCESS, data: updatedCategory }));
}
