import { userRepo } from '../repository/user.repo';
import { userService } from '../service/user.service';
import { Request, Response } from 'express';

const service = userService(userRepo);

export const userController = {
  async getAllUsers(req: Request, res: Response) {
    try {
      const { search, user_id } = req.query;
      const users = await service.fetchUsers(search as string, user_id as string);
      res.status(200).json(

        users,
        
      );
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  },
  async createUser(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, phoneNumber, accountId, password, role } = req.body;
      const user = await service.createUser({ firstName, lastName, email, phoneNumber, accountId, password, role });
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  },
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await service.fetchUserById(id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  },
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phoneNumber, accountId, password, role } = req.body;
      await service.updateUser({ firstName, lastName, email, phoneNumber, accountId, password, role }, id);
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  },
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await service.deleteUser(id);
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  },
  async createAccountRequest(req: Request, res: Response) {
    try {
      const data = req.body;
      await service.createAccountRequest(data);
      res.status(201).json({
        success: true,
        message: 'Account request created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  },
  async getAllAccountRequests(req: Request, res: Response) {
    try {
      const accountRequests = await service.fetchAllAccountRequests();
      res.status(200).json(accountRequests);
    } catch (error) {
      console.log(error, "from user controller")
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  },
  async updateAccountRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await service.updateAccountRequest(id, status, req.headers);
      res.status(200).json({
        success: true,
        message: 'Account request updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  },
  async getAccountRequestById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const accountRequest = await service.fetchAccountRequestById(id);
      res.status(200).json({
        success: true,
        data: accountRequest,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  },
};
