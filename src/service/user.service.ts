import { AppError } from '../middleware/errorHandler';
import { UserRepo } from '../repository/user.repo';
import { AccountRequestQuerySchema, userMutationSchema } from '../types/modules/user';
import z from 'zod';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';
import { IncomingHttpHeaders } from 'http';

export const userService = (repo: UserRepo) => {
  return {
    fetchUsers: async (search?: string, user_id?: string) => {
      return await repo.fetchUsers(search, user_id);
    },
    createUser: async (data: z.infer<typeof userMutationSchema>) => {
      return await repo.createUser(data);
    },
    fetchAgentByAccountId: async (account_id: string) => {
      return await repo.fetchAgentByAccountId(account_id);
    },
    fetchAllAgent: async (agentName?: string, user_id?: string) => {
      return await repo.fetchAllAgent(agentName, user_id);
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
    updateAccountRequest: async (id: string, status: 'pending' | 'approved' | 'rejected', headers: IncomingHttpHeaders) => {

      const account_request = await repo.fetchAccountRequestById(id);

      if (!account_request) {
        throw new AppError('Account request not found', true, 404);
      }
      if (status === 'approved') {
        const response = await auth.api.signUpEmail({
          body: {
            email: account_request[0]?.email!,
            password: account_request[0]?.phoneNumber!,
            firstName: account_request[0]?.firstName!,
            lastName: account_request[0]?.lastName!,
            name: `${account_request[0]?.firstName} ${account_request[0]?.lastName}`,
            role: account_request[0]?.role as 'owner' | 'member' | 'admin',
            phoneNumber: account_request[0]?.phoneNumber!,
            percentageCommission: 25,
          },
        })


        if (account_request[0]?.role === 'owner') {

          await auth.api.createOrganization({
            body: {
              name: account_request[0]?.orgName!,
              slug: account_request[0]?.orgName!.toLowerCase().replace(/ /g, '-'),

              metadata: {
                isAdminOrganization: false,
              },
              userId: response.user.id,
            },

          })
        }
        await auth.api.sendVerificationEmail({
          body: {
            email: account_request[0]?.email!,
          },
        })

      }
      return await repo.updateAccountRequest(id, status);
    },
    fetchAccountRequestById: async (id: string) => {
      return await repo.fetchAccountRequestById(id);
    },
  };
};
