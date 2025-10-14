import { MESSAGE } from '../constants/message.js';
import ErrorResponse from '../lib/helper/ErrorResponse.js';
import { toResultOk } from '../results/Result.js';
import Category from '../models/Category.js';

// Get all categories
export const getAllCategories = async (req, res) => {
    const categories = await Category.find();
    if (categories.length === 0) {
        throw new ErrorResponse(400, MESSAGE.CATEGORY_FETCH_FAILED);
    }
    res.json(toResultOk({ msg: MESSAGE.CATEGORY_FETCH_SUCCESS, data: categories }));
}
