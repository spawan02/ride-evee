import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController';
import {userMiddleware} from '../middleware/index';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', userMiddleware, createUser);
router.put('/:id', userMiddleware, updateUser);
router.delete('/:id', userMiddleware, deleteUser);

export default router;
