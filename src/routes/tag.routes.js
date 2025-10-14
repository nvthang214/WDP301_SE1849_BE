import express from 'express';
import { 
    getAllTags
} from '../controllers/tag.controller.js';
import { wrapAsync } from '../middlewares/error.middleware.js';
import { authMiddleware} from '../middlewares/auth.middleware.js';

const tagRoutes = express.Router();
// tagRoutes.use(authMiddleware);
// get all tags
tagRoutes.get('/', wrapAsync(getAllTags));

export default tagRoutes;