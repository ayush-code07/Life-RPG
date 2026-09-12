import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';

const router = Router();

// GET /api/items
router.get('/', ItemController.getCatalog);

// GET /api/items/:itemId
router.get('/:itemId', ItemController.getItemById);

export default router;
