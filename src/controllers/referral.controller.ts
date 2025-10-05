import { referralRepo } from "../repository/referrals.repo";
import { ReferralService } from "../service/referrals.service";
import { Request, Response } from "express";

const service = ReferralService(referralRepo);

export const referralController = {
    createReferralRequest: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            await service.createReferralRequest(data);
            res.status(201).json({ message: 'Referral request created successfully' });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchReferralRequestById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const data = await service.fetchReferralRequestById(id);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchReferralRequests: async (req: Request, res: Response) => {
        try {
            const data = await service.fetchReferralRequests();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    changeReferralRequestStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await service.changeReferralRequestStatus(id, status);
            res.status(200).json({ message: 'Referral request status changed successfully' });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchReferralByUserId: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const data = await service.fetchReferralByUserId(id);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchReferrerStatsByUserId: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const data = await service.fetchReferrerStatsByUserId(id);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchReferralCommissionByUserId: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const data = await service.fetchReferralCommissionByUserId(id);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
}