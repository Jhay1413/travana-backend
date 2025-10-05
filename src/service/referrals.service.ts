import { ReferralRepo } from "../repository/referrals.repo"
import { ReferralRequest } from "../types/modules/referrals/mutation"


export const ReferralService = (repo: ReferralRepo) => {
    return {
        createReferralRequest: async (data: ReferralRequest) => {
            return await repo.createReferralRequest(data);
        },
        fetchReferralRequestById: async (id: string) => {
            return await repo.fetchReferralRequestById(id);
        },
        fetchReferralRequests: async () => {
            return await repo.fetchReferralRequests();
        },
        changeReferralRequestStatus: async (id: string, status: string) => {
            return await repo.changeReferralRequestStatus(id, status);
        },
        fetchReferralByUserId: async (id: string) => {
            return await repo.fetchReferralByUserId(id);
        },
        fetchReferrerStatsByUserId: async (id: string) => {
            return await repo.fetchReferrerStatsByUserId(id);
        },
        fetchReferralCommissionByUserId: async (id: string) => {
            return await repo.fetchReferralCommissionByUserId(id);
        },
        insertReferral: async (transaction_id:string,referrerId:string,commission:string) => {
            return await repo.insertReferral(transaction_id,referrerId,commission);
        },
    }
}