import { chatRepo } from "../repository/chat.repo";
import { chatService } from "../service/chat.service";

import { Request, Response } from "express";

const service = chatService(chatRepo);

export const chatController = {
    getRooms: async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId
            const filtersToFormat = {
                search: req.query.search as string | undefined,
                type: req.query.type as 'direct' | 'group' | 'all' | undefined,
                unreadOnly: req.query.unreadOnly === 'true' ? true : req.query.unreadOnly === 'false' ? false : undefined,
                userId: req.query.userId as string | undefined,
                limit: req.query.limit as string | undefined,
                cursor: req.query.cursor as string | undefined,
            }
            const result = await service.getRooms(userId as unknown as string, filtersToFormat);
            res.status(200).json(result);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getRoom: async (req: Request, res: Response) => {
        try {
            const roomId = req.params.id;
            const userId = req.query.userId as string | undefined; // Will be set by frontend
            const result = await service.getRoom(roomId, userId || '');
            res.status(200).json(result);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getMessages: async (req: Request, res: Response) => {
        try {
            const roomId = req.params.id;
            const filtersToFormat = {
                limit: req.query.limit as string | undefined,
                cursor: req.query.cursor as string | undefined,
                userId: req.query.userId as string | undefined, // Will be set by frontend
            }
            const result = await service.getMessages(filtersToFormat, roomId);
            res.status(200).json(result);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    sendMessage: async (req: Request, res: Response) => {
        try {
            const roomId = req.params.id

            const result = await service.sendMessage(req.body, roomId || '');
            res.status(200).json(result);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    createRoom: async (req: Request, res: Response) => {
        try {
            const creatorId = req.body.creatorId as string | undefined; // Will be set by frontend
            const result = await service.createRoom(req.body, creatorId || '');
            res.status(200).json(result);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    joinRoom: async (req: Request, res: Response) => {
        try {
            const roomId = req.params.roomId;
            if (!roomId) {
                return res.status(400).json({ error: 'Room ID is required' });
            }
            const result = await service.joinRoom(req.body);
            return res.status(200).json(result);
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    leaveRoom: async (req: Request, res: Response) => {
        try {
            const roomId = req.params.roomId;
            const userId = req.body.userId;


            if (!roomId || !userId) {
                return res.status(400).json({ error: 'Room ID and User ID are required' });
            }
            const body = {
                roomId: roomId,
                userId: userId
            }
            await service.leaveRoom(roomId, body);
            return res.status(200).json({
                message: 'Left room successfully',
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Internal Server Error' });

        }

    },
    markMessageAsRead: async (req: Request, res: Response) => {
        try {
            const messageId = req.params.messageId;
            if (!messageId) {
                return res.status(400).json({ error: 'Message ID is required' });
            }
            const body = {
                messageId: messageId,
                userId: req.body.userId
            }
            await service.markMessageAsRead(messageId, body);
            return res.status(200).json({
                message: 'Message marked as read successfully',
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    updateRoom: async (req: Request, res: Response) => {
        try {
            const roomId = req.params.roomId;
            const updates = req.body;
            if (!roomId) {
                return res.status(400).json({ error: 'Room ID is required' });
            }
            const result = await service.updateRoom(roomId, updates, updates.userId || '');
            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    deleteRoom: async (req: Request, res: Response) => {
        try {
            const roomId = req.params.roomId;
            const userId = req.body.userId;

            if (!roomId || !userId) {
                return res.status(400).json({ error: 'Room ID and User ID are required' });
            }

            await service.deleteRoom(userId, roomId);
            return res.status(200).json({
                message: 'Room deleted successfully',
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    countUnreadMessages: async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }
            const result = await service.countUnreadMessages(userId);
            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    markAllMessageAsRead: async (req: Request, res: Response) => {
        try {
            const roomId = req.params.roomId;
            const userId = req.body.userId;

            if (!roomId || !userId) {
                return res.status(400).json({ error: 'Room ID and User ID are required' });
            }
            await service.markAllMessageAsRead(roomId, userId);
            return res.status(200).json({
                message: 'All messages marked as read successfully',
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}