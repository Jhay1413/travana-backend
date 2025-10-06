import { InquiryRepo } from '../repository/inquiry.repo';
import { ReferralRepo } from '../repository/referrals.repo';
import { enquiry_mutate_schema } from '../types/modules/transaction/mutation';
import z from 'zod';
import { AuthRepo } from '../repository/auth.repo';

export const inquiryService = (repo: InquiryRepo, referralRepo: ReferralRepo, authRepo: AuthRepo) => {
  return {
    markDeletionCodeAsUsed: async (deletionCodeId: string) => {
      return await repo.markDeletionCodeAsUsed(deletionCodeId);
    },
    softDeleteInquiry: async (inquiryId: string, deletionCode: string, deletedBy: string) => {
      return await repo.softDeleteInquiry(inquiryId, deletionCode, deletedBy);
    },
    restoreInquiry: async (inquiryId: string) => {
      return await repo.restoreInquiry(inquiryId);
    },
    getDeletedInquiries: async (page: number, limit: number) => {
      return await repo.getDeletedInquiries(page, limit);
    },
    insertInquiry: async (data: z.infer<typeof enquiry_mutate_schema>) => {


      const result = await repo.insertInquiry(data);

      const referrer = await referralRepo.fetchReferrerByClientId(data.client_id);
      if (result.transaction_id && referrer.referrerId) {
        const organization = await authRepo.fetchOrganizationByUserId(referrer.referrerId);
        if (organization) {
          const owner = await authRepo.fetchOwnerOrganizationByOrgId(organization.organizationId);
          if (!owner) {
            await referralRepo.insertReferral(result.transaction_id, referrer.referrerId, referrer.percentageCommission?.toString() ?? '0');
          }
          else {
            if (owner.userId === referrer.referrerId) {
              await referralRepo.insertReferral(result.transaction_id, owner.userId, referrer.percentageCommission?.toString() ?? '0' + '5');
            } else {
              await referralRepo.insertReferral(result.transaction_id, referrer.referrerId, referrer.percentageCommission?.toString() ?? '0');
              await referralRepo.insertReferral(result.transaction_id, owner.userId, '5');
            }
          }
        }
        else {
          await referralRepo.insertReferral(result.transaction_id, referrer.referrerId, referrer.percentageCommission?.toString() ?? '0');
        }
      }
      return {
        transaction_id: result.transaction_id,
      };
    },
    updateInquiry: async (inquiryId: string, data: z.infer<typeof enquiry_mutate_schema>) => {
      return await repo.updateInquiry(inquiryId, data);
    },
    fetchInquiryById: async (inquiryId: string) => {
      return await repo.fetchInquiryById(inquiryId);
    },
    fetchInquiryForUpdate: async (inquiryId: string) => {
      return await repo.fetchInquiryForUpdate(inquiryId);
    },
    fetchInquiryToConvert: async (inquiryId: string) => {
      return await repo.fetchInquiryToConvert(inquiryId);
    },
    fetchInquiries: async (
      agentId?: string,
      clientId?: string,
      filters?: {
        search?: string;
        enquiry_status?: string;
        holiday_type?: string;
        travel_date_from?: string;
        travel_date_to?: string;
        budget_min?: string;
        budget_max?: string;
        destination?: string;
        is_future_deal?: string;
        is_active?: boolean;
        client_name?: string;
        agent_name?: string;
        cabin_type?: string;
        board_basis?: string;
        departure_port?: string;
        departure_airport?: string;
      },
      pagination?: {
        page?: number;
        limit?: number;
      }
    ) => {
      return await repo.fetchInquiries(agentId, clientId, filters, pagination);
    },
    updateInquiryExpiry: async (inquiryId: string, date_expiry: string, user_id: string) => {
      return await repo.updateInquiryExpiry(inquiryId, date_expiry, user_id);
    },
    setFutureDealDate: async (inquiryId: string, futureDealDate: string) => {
      return await repo.setFutureDealDate(inquiryId, futureDealDate);
    },
    unsetFutureDealDate: async (inquiryId: string) => {
      return await repo.unsetFutureDealDate(inquiryId);
    },
    updateInquiryStatus: async (inquiryId: string, status: string) => {
      return await repo.updateInquiryStatus(inquiryId, status);
    },
  };
};
