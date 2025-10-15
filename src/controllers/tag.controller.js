import { MESSAGE } from '../constants/message.js';
import ErrorResponse from '../lib/helper/ErrorResponse.js';
import { toResultOk } from '../results/Result.js';
import Tag from '../models/Tag.js';

// Get all tags
export const getAllTags = async (req, res) => {
    const tags = await Tag.find();
    res.json(toResultOk({ msg: MESSAGE.TAG_FETCH_SUCCESS, data: tags }));
}

