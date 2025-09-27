import { Router } from 'express';
import { getAllUsers, createUser, getCertificates, getTechnicianInfo, getTechnicianCertificates } from '../controllers/user.controller.js';

export const userRouter = Router();

userRouter.get('/', getAllUsers);
userRouter.post('/', createUser);
userRouter.get('/certificates', getCertificates);
userRouter.get('/:userId/technician', getTechnicianInfo);
userRouter.get('/:userId/certificates', getTechnicianCertificates);
