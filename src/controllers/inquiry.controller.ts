import { inquiryService } from '../service/inquiry.service';
import { inquiryRepo } from '../repository/inquiry.repo';
import { referralRepo } from '../repository/referrals.repo';
import { authRepo } from '../repository/auth.repo';
import { Request, Response } from 'express';

const service = inquiryService(inquiryRepo,referralRepo,authRepo);

export const inquiryController = {
  deleteInquiry: async (req: Request, res: Response) => {
    try {
      const { deletionCode, deletedBy } = req.query as { deletionCode: string; deletedBy: string };
      const { id } = req.params;
      await service.softDeleteInquiry(id, deletionCode, deletedBy);
      res.status(200).json({ message: 'Inquiry deleted' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  restoreInquiry: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await service.restoreInquiry(id);
      res.status(200).json({ message: 'Inquiry restored' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  getDeletedInquiries: async (req: Request, res: Response) => {
    try {
      const { page, limit } = req.query;
      const inquiries = await service.getDeletedInquiries(Number(page), Number(limit));
      res.status(200).json( inquiries );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  createInquiry: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const inquiry = await service.insertInquiry(data);
      res.status(201).json({ transaction_id: inquiry.transaction_id });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateInquiry: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const inquiry = await service.updateInquiry(id, data);
      res.status(200).json( inquiry );
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchInquiryById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const inquiry = await service.fetchInquiryById(id);
      res.status(200).json( inquiry );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchInquiryForUpdate: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const inquiry = await service.fetchInquiryForUpdate(id);
      res.status(200).json( inquiry );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchInquiryToConvert: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const inquiry = await service.fetchInquiryToConvert(id);
      res.status(200).json( inquiry );
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  fetchInquiries: async (req: Request, res: Response) => {
    try {
      const { agentId, clientId, ...filters } = req.query;
      const { page, limit, ...otherFilters } = filters;
      const pagination = { page: Number(page), limit: Number(limit) };
      const inquiries = await service.fetchInquiries(agentId as string, clientId as string, otherFilters, pagination);
      res.status(200).json( inquiries );
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateInquiryExpiry: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { date_expiry,user_id } = req.body;
      await service.updateInquiryExpiry(id, date_expiry, user_id);
      res.status(200).json({ message: 'Inquiry expiry updated' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateFutureDealDate: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { futureDealDate } = req.body;
      
      if (futureDealDate === null || futureDealDate === undefined) {
        await service.unsetFutureDealDate(id);
        res.status(200).json({ message: 'Future deal date unset' });
      } else {
        await service.setFutureDealDate(id, futureDealDate);
        res.status(200).json({ message: 'Future deal date set' });
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
  updateInquiryStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await service.updateInquiryStatus(id, status);
      res.status(200).json({ message: 'Inquiry status updated' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    }
  },
};
