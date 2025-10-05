import { db } from '../db/db';
import { AppError } from '../middleware/errorHandler';
import { user } from '../schema/auth-schema';
import { account_request, usersTable } from '../schema/user-schema';
import { AccountRequestQuerySchema, accountRequestSchema, userMutationSchema, userQuerySchema, UserQuerySchema } from '../types/modules/user';
import { desc, eq, ilike, or } from 'drizzle-orm';
import z from 'zod';

export type UserRepo = {
  fetchUsers: (search?: string) => Promise<UserQuerySchema[]>;
  createUser: (data: z.infer<typeof userMutationSchema>) => Promise<void>;
  fetchAgentByAccountId: (account_id: string) => Promise<UserQuerySchema>;
  fetchAllAgent: (agentName?: string) => Promise<UserQuerySchema[]>;
  fetchUserById: (user_id: string) => Promise<UserQuerySchema>;
  updateUser: (data: z.infer<typeof userMutationSchema>, user_id: string) => Promise<void>;
  deleteUser: (user_id: string) => Promise<void>;
  createAccountRequest: (data: AccountRequestQuerySchema) => Promise<void>;
  fetchAllAccountRequests: () => Promise<AccountRequestQuerySchema[]>;
  updateAccountRequest: (id: string, status: 'pending' | 'approved' | 'rejected') => Promise<void>;
  fetchAccountRequestById: (id: string) => Promise<AccountRequestQuerySchema[]>;
};
export const userRepo: UserRepo = {
  
  async fetchUsers(search?: string) {


    console.log(search,"from user repo")
    try {
      const response = await db.query.user.findMany({
        where: search ? ilike(user.firstName, `%${search}%`) : undefined,
        limit: 10,
      });
      return response;
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong', true, 500);
    }
  },
  async createUser(data: z.infer<typeof userMutationSchema>) {
    try {
      await db.insert(usersTable).values(data);
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong', true, 500);
    }
  },
  async fetchAgentByAccountId(account_id: string) {
    try {
      const response = await db.query.user.findFirst({
        where: eq(user.id, account_id),
      });
      if (!response) {
        throw new AppError('User not found', true, 404);
      }
      return response;
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong', true, 500);
    }
  },
  async fetchAllAgent(agentName?: string) {
    try {
      const response = await db.query.user.findMany({
        where: agentName ? or(ilike(user.firstName, `${agentName}%`), ilike(user.lastName, `${agentName}%`)) : undefined,
      });
      return response;
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong', true, 500);
    }
  },
  async fetchUserById(user_id: string) {
    try {
      const response = await db.query.user.findFirst({
        where: eq(user.id, user_id),
      });
      console.log(response)
      if (!response) {
        throw new AppError('User not found', true, 404);
      }
      return response;
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong', true, 500);
    }
  },
  async updateUser(data: z.infer<typeof userMutationSchema>, user_id: string) {
    try {
      await db.update(usersTable).set(data).where(eq(usersTable.id, user_id)).returning();
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong', true, 500);
    }
  },
  async deleteUser(user_id: string) {
    try {
      await db.delete(usersTable).where(eq(usersTable.id, user_id)).returning();
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong', true, 500);
    }
  },
  async createAccountRequest(data: AccountRequestQuerySchema) {
    try {
      await db.insert(account_request).values({
        ...data,
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        role: data.role ?? '',
      });
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong', true, 500);
    }
  },
  async fetchAllAccountRequests() {
    try {

      console.log("from user repo")
      const response = await db.query.account_request.findMany({
      });

      return response.map((item) => ({
        ...item,
        role: item.role as 'owner' | 'admin' | 'member',
      }));
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong', true, 500);
    }
  },
  async updateAccountRequest(id: string, status: 'pending' | 'approved' | 'rejected') {
    try {
      await db.update(account_request).set({ status }).where(eq(account_request.id, id));
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong', true, 500);
    }
  },
  async fetchAccountRequestById(id: string) {
    try {
      const response = await db.query.account_request.findFirst({
        where: eq(account_request.id, id),
      });
      if (!response) {
        throw new AppError('Account request not found', true, 404);
      }
      return [
        {
          ...response,
          role: response.role as 'owner' | 'admin' | 'member',
        },
      ];
    } catch (error) {
      console.log(error);
      throw new AppError('Something went wrong', true, 500);
    }
  },
};
