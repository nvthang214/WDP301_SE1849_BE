import { MESSAGE } from '../constants/message.js';
import ErrorResponse from '../lib/helper/ErrorResponse.js';
import { toResultOk } from '../results/Result.js';
import Tag from '../models/Tag.js';

// Get all tags with pagination and search
export const getAllTags = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        
        // Build query
        let query = {};
        
        // Search filter
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Tag.countDocuments(query);
        
        const tags = await Tag.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            message: MESSAGE.TAG_FETCH_SUCCESS,
            data: tags,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Error getting tags:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Create new tag
export const createTag = async (req, res) => {
    const { name } = req.body;
    const newTag = new Tag({ name });
    await newTag.save();
    res.json(toResultOk({ msg: MESSAGE.TAG_CREATE_SUCCESS, data: newTag }));
}

// Update tag by id
export const updateTag = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const updatedTag = await Tag.findByIdAndUpdate(id, { name }, { new: true });
    if (!updatedTag) {
        throw new ErrorResponse(MESSAGE.TAG_NOT_FOUND, 404);
    }
    res.json(toResultOk({ msg: MESSAGE.TAG_UPDATE_SUCCESS, data: updatedTag }));
}
