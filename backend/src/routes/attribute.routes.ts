import { Router } from 'express';
import { AttributeController } from '../controllers/attribute.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// GET /api/attributes (public catalog)
router.get('/', AttributeController.getAllAttributes);

// Subroutes mounted under /api/profile/me/attributes
export const profileAttributesRouter = Router();
profileAttributesRouter.use(authenticateToken);
profileAttributesRouter.get('/', AttributeController.getMyAttributes);
profileAttributesRouter.post('/', AttributeController.seedMyAttributes);

export default router;
