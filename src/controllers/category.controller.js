import { MESSAGE } from '../constants/message.js';
import ErrorResponse from '../lib/helper/ErrorResponse.js';
import { toResultOk } from '../results/Result.js';
import Category from '../models/Category.js';
import Job from '../models/Job.js';

// Get all categories with pagination and search
export const getAllCategories = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        
        // Build query
        let query = {};
        
        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Category.countDocuments(query);
        
        const categories = await Category.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            message: MESSAGE.CATEGORY_FETCH_SUCCESS,
            data: categories,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Error getting categories:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
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

// Get popular categories with openings count
export const getPopularCategories = async (req, res) => {
    const { limit = 8, onlyActive = 'true' } = req.query;

    const matchStage = {};
    if (onlyActive === 'true') {
        matchStage.isActive = true;
    }

    const results = await Job.aggregate([
        { $match: matchStage },
        { $match: { category: { $ne: null } } },
        { $group: { _id: '$category', openings: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $project: { _id: 0, label: '$category.name', openings: 1 } },
        { $sort: { openings: -1 } },
        { $limit: parseInt(limit) }
    ]);

    res.json(toResultOk({ msg: MESSAGE.CATEGORY_FETCH_SUCCESS, data: results }));
}

