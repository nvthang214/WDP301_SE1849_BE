import express from 'express';
import { 
    getAllTags,
    createTag,
    updateTag
} from '../controllers/tag.controller.js';
import { wrapAsync } from '../middlewares/error.middleware.js';
import { authMiddleware} from '../middlewares/auth.middleware.js';

const tagRoutes = express.Router();
tagRoutes.use(authMiddleware);
// get all tags
tagRoutes.get('/', wrapAsync(getAllTags));

// create new tag
tagRoutes.post('/create', wrapAsync(createTag));
// update tag by id
tagRoutes.put('/edit/:id', wrapAsync(updateTag));

export default tagRoutes;