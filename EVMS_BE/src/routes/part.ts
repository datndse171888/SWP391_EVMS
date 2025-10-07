import { Router } from 'express';
import { getParts } from '../controllers/partController.js';

export const partRouter = Router();

// Public list
partRouter.get('/', getParts);


