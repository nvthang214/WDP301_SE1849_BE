import express from 'express';
import { 
    getAllCategories
} from '../controllers/category.controller.js';
import { wrapAsync } from '../middlewares/error.middleware.js';
import { authMiddleware} from '../middlewares/auth.middleware.js';

const categoryRouter = express.Router();
// categoryRouter.use(authMiddleware);

// Public route to get all categories
categoryRouter.get('/', wrapAsync(getAllCategories));

export default categoryRouter;