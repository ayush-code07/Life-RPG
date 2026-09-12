import { Router } from 'express';
import profileRoutes from './profile.routes';
import attributeRoutes, { profileAttributesRouter } from './attribute.routes';
import tasksRouter, { profileTasksRouter } from './task.routes';
import inventoryRouter, { profileInventoryRouter } from './inventory.routes';
import itemRoutes from './item.routes';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Life RPG Backend Engine',
  });
});

// Profile base routes (/api/profile/me, /api/profile/me/streak)
apiRouter.use('/profile', profileRoutes);

// Profile subroutes (/api/profile/me/attributes)
apiRouter.use('/profile/me/attributes', profileAttributesRouter);

// Profile subroutes (/api/profile/me/tasks & /api/profile/me/history)
apiRouter.use('/profile/me', profileTasksRouter);

// Profile subroutes (/api/profile/me/inventory)
apiRouter.use('/profile/me', profileInventoryRouter);

// Attribute catalog routes (/api/attributes)
apiRouter.use('/attributes', attributeRoutes);

// Item catalog routes (/api/items)
apiRouter.use('/items', itemRoutes);

// Task single-entity routes (/api/tasks/:taskId, /api/tasks/:taskId/complete)
apiRouter.use('/tasks', tasksRouter);

// Inventory single-entity routes (/api/inventory/:inventoryId)
apiRouter.use('/inventory', inventoryRouter);

export default apiRouter;
