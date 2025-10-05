import { Router, Request, Response } from 'express';
import { userController } from '../controllers/user.controller';

const router = Router();

// GET /api/users
router.get('/', userController.getAllUsers);

// GET /api/users/:id
router.get('/user/:id', userController.getUserById);

// POST /api/users
router.post('/', userController.createUser);

// PUT /api/users/:id
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id
router.delete('/:id', userController.deleteUser);



router.get('/account-requests', userController.getAllAccountRequests);
router.get('/account-requests/:id', userController.getAccountRequestById);
router.put('/account-requests/:id', userController.updateAccountRequest);
router.post('/account-request', userController.createAccountRequest);

export default router;
