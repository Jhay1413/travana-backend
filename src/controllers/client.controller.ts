import { clientRepo } from "../repository/client.repo";
import { clientService } from "../service/client.service";
import { s3Service } from "../lib/s3";
import { Request, Response } from "express";
const service = clientService(clientRepo, s3Service);

export const clientController = {
    fetchClientById: async (req: Request, res: Response) => {

        try {
            const { id } = req.params;
            const client = await service.fetchClientById(id);
            res.status(200).json(client);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchClients: async (req: Request, res: Response) => {
        try {
            const { page, clientName, clientId } = req.query;
            const clients = await service.fetchClients(Number(page), clientName as string, clientId as string);
            res.status(200).json(clients);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    createClient: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const clientId = await service.createClient(data);
            res.status(201).json({ client_id: clientId.clientId });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    updateClient: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const data = req.body;
            await service.updateClient(id, data);
            res.status(200).json({ message: 'Client updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    deleteClient: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await service.deleteClient(id);
            res.status(200).json({ message: 'Client deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchInquirySummary: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const inquirySummary = await service.fetchInquirySummary(id);
            res.status(200).json(inquirySummary);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchClientTransactions: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.query;
            const clientTransactions = await service.fetchClientTransactions(id, status as string);
            res.status(200).json(clientTransactions);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    fetchClientForUpdate: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const client = await service.fetchClientForUpdate(id);
            res.status(200).json(client);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    uploadClientAvatar: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const avatar = req.file;

            if (!avatar) {
                return res.status(400).json({ error: 'No file provided' });
            }

            await service.uploadClientAvatar(id, avatar);
            return res.status(200).json({ message: 'Client avatar uploaded successfully' });
        } catch (error) {
            return res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    },
    getSignedUrl: async (req: Request, res: Response) => {
        try {
            const { fileKey } = req.params;
            const signedUrl = await service.getSignedUrl(fileKey);
            res.status(200).json({ signedUrl });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
        }
    }
}