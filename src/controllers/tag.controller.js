import { MESSAGE } from '../constants/message.js';
import ErrorResponse from '../lib/helper/ErrorResponse.js';
import { toResultOk } from '../results/Result.js';
import Tag from '../models/Tag.js';

// Get all tags
export const getAllTags = async (req, res) => {
    const tags = await Tag.find();
    res.json(toResultOk({ msg: MESSAGE.TAG_FETCH_SUCCESS, data: tags }));
}

// Create new tag
export const createTag = async (req, res) => {
    const { name, description } = req.body;
    const newTag = new Tag({ name, description });
    await newTag.save();
    res.json(toResultOk({ msg: MESSAGE.TAG_CREATE_SUCCESS, data: newTag }));
}

// Update tag by id
export const updateTag = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const updatedTag = await Tag.findByIdAndUpdate(id, { name, description }, { new: true });
    if (!updatedTag) {
        throw new ErrorResponse(MESSAGE.TAG_NOT_FOUND, 404);
    }
    res.json(toResultOk({ msg: MESSAGE.TAG_UPDATE_SUCCESS, data: updatedTag }));
}
