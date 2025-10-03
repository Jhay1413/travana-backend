import { UserRepo } from '../repository/user.repo';
import { AccountRequestQuerySchema, userMutationSchema } from '../types/modules/user';
import z from 'zod';

export const userService = (repo: UserRepo) => {
  return {
    fetchUsers: async (search?: string) => {
      return await repo.fetchUsers(search);
    },
    createUser: async (data: z.infer<typeof userMutationSchema>) => {
      return await repo.createUser(data);
    },
    fetchAgentByAccountId: async (account_id: string) => {
      return await repo.fetchAgentByAccountId(account_id);
    },
    fetchAllAgent: async (agentName?: string) => {
      return await repo.fetchAllAgent(agentName);
    },
    fetchUserById: async (user_id: string) => {
      return await repo.fetchUserById(user_id);
    },
    updateUser: async (data: z.infer<typeof userMutationSchema>, user_id: string) => {
      return await repo.updateUser(data, user_id);
    },
    deleteUser: async (user_id: string) => {
      return await repo.deleteUser(user_id);
    },
    createAccountRequest: async (data: AccountRequestQuerySchema) => {
      return await repo.createAccountRequest(data);
    },
    fetchAllAccountRequests: async () => {
      return await repo.fetchAllAccountRequests();
    },
    updateAccountRequest: async (id: string, status: 'pending' | 'approved' | 'rejected') => {
      return await repo.updateAccountRequest(id, status);
    },
    fetchAccountRequestById: async (id: string) => {
      return await repo.fetchAccountRequestById(id);
    },
  };
};
