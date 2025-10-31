import { ClientRepo } from "../repository/client.repo";
import { S3Service } from "../lib/s3";
import { clientMutationSchema } from "../types/modules/client";
import z from "zod";





export const clientService = (repo: ClientRepo, s3Service: S3Service) => {
    return {

        fetchClientById: async (id: string) => {
            const client = await repo.fetchClientById(id);
            if (!client.avatarUrl) return client;
            const signedUrl = await s3Service.getSignedUrl(client.avatarUrl);
            return {
                ...client,
                avatarUrl: signedUrl
            }
        },
        fetchClients: async (page: number, query: string, clientId: string) => {
            const clients = await repo.fetchClients(page, query, clientId);
            const signedUrls = await Promise.all(clients.map(async (client) => {
                if (!client.avatarUrl) return client;
                const signedUrl = await s3Service.getSignedUrl(client.avatarUrl);
                return {
                    ...client,
                    avatarUrl: signedUrl
                }
            }));
            return signedUrls;
        },
        createClient: async (data: z.infer<typeof clientMutationSchema>) => {
            return await repo.createClient(data);
        },
        updateClient: async (id: string, data: z.infer<typeof clientMutationSchema>) => {
            return await repo.updateClient(id, data);
        },
        deleteClient: async (id: string) => {
            return await repo.deleteClient(id);
        },
        fetchInquirySummary: async (clientId: string) => {
            return await repo.fetchInquirySummary(clientId);
        },
        fetchClientTransactions: async (clientId: string, status: string) => {
            return await repo.fetchClientTransactions(clientId, status);
        },
        fetchClientForUpdate: async (id: string) => {
            return await repo.fetchClientForUpdate(id);
        },
        uploadClientAvatar: async (id: string, avatar: Express.Multer.File) => {

            if (!avatar) {
                throw new Error('No file provided');
            }

            // Upload file to S3 and get the URL
            const avatarUrl = await s3Service.uploadAvatar(avatar);

            // Update client with the new avatar URL
            return await repo.uploadClientAvatar(id, avatarUrl);
        },
        getSignedUrl: async (fileKey: string) => {
            return await s3Service.getSignedUrl(fileKey);
        },
        uploadClientFile: async (id: string, file: Express.Multer.File, fileType: string, fileTitle: string) => {

            const clientName = await repo.getClientName(id);
            const fileUrl = await s3Service.uploadClientFile(file, clientName ?? "unknown");
            return await repo.insertClientFile({ fileUrl, fileType, filename: file.originalname, fileTitle, clientId: id });
        },
        fetchClientFiles: async (clientId: string) => {
            const signedUrls = await Promise.all(
                (await repo.fetchClientFiles(clientId)).map(async (file) => {
                    const signedUrl = await s3Service.getSignedUrl(file.fileUrl);
                    return {
                        ...file,
                        signedUrl: signedUrl
                    };
                })
            );
            return signedUrls;
        },
        fetchClientFile: async (fileId: string) => {
            return await repo.fetchClientFile(fileId);
        },
        deleteClientFile: async (fileId: string) => {
            return await repo.deleteClientFile(fileId);
        },
        getClientFileCount: async (clientId: string) => {
            console.log("Getting file count for client:", clientId);
            return await repo.getClientFileCount(clientId);
        },
        getClientName: async (clientId: string) => {
            return await repo.getClientName(clientId);
        }

    }
};
