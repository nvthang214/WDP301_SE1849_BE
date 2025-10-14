import { MESSAGE } from '../constants/message.js';
import ErrorResponse from '../lib/helper/ErrorResponse.js';
import { toResultOk } from '../results/Result.js';
import Category from '../models/Category.js';

// Get all categories
export const getAllCategories = async (req, res) => {
    const categories = await Category.find();
    res.json(toResultOk({ msg: MESSAGE.CATEGORY_FETCH_SUCCESS, data: categories }));
}
