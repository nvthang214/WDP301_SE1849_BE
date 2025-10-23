import express from 'express';
import { 
    getAllCategories,
    createCategory,
    updateCategory
} from '../controllers/category.controller.js';
import { wrapAsync } from '../middlewares/error.middleware.js';
import { authMiddleware} from '../middlewares/auth.middleware.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';

const categoryRouter = express.Router();


// Public route to get all categories
categoryRouter.get('/', wrapAsync(getAllCategories));

// create new category
categoryRouter.use(authMiddleware, adminMiddleware);
categoryRouter.post('/create', wrapAsync(createCategory));
// update category by id
categoryRouter.put('/edit/:id', wrapAsync(updateCategory));

export default categoryRouter;