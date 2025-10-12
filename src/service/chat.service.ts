import { ChatRepo, } from "@/repository/chat.repo";
import { chatFiltersQuerySchema, chatMessagesQuerySchema, createRoomMutationSchema, joinRoomMutationSchema, leaveRoomMutationSchema, markMessageAsReadMutationSchema, sendMessageMutationSchema, updateRoomMutationSchema } from "@/types/modules/chat";
import { join } from "path";
import z from "zod";


export const chatService = (chatRepo: ChatRepo) => {


    return {

        getRooms: (userId: string, filters: z.infer<typeof chatFiltersQuerySchema>) => {
            return chatRepo.getRooms(userId, filters);

        },
        getRoom: (roomId: string, userId: string) => {
            return chatRepo.getRoom(roomId, userId);
        },
        getMessages: (filters: z.infer<typeof chatMessagesQuerySchema>, roomId: string) => {
            return chatRepo.getMessages(filters, roomId);
        },
        sendMessage: (data: z.infer<typeof sendMessageMutationSchema>, roomId: string) => {
            return chatRepo.sendMessage(data, roomId);
        },
        createRoom: (data: z.infer<typeof createRoomMutationSchema>, creatorId: string) => {
            return chatRepo.createRoom(data, creatorId);
        },
        joinRoom(data: z.infer<typeof joinRoomMutationSchema>) {
            return chatRepo.joinRoom(data);
        },
        leaveRoom: (id: string, data: z.infer<typeof leaveRoomMutationSchema>) => {
            return chatRepo.leaveRoom(id, data);
        },
        markMessageAsRead: (id: string, data: z.infer<typeof markMessageAsReadMutationSchema>) => {
            return chatRepo.markMessageAsRead(id, data);
        },
        updateRoom: (roomId: string, data: z.infer<typeof updateRoomMutationSchema>, userId: string) => {
            return chatRepo.updateRoom(roomId, data, userId);
        },
        deleteRoom: (userId: string, roomId: string) => {
            return chatRepo.deleteRoom(userId, roomId);
        },
        countUnreadMessages: (userId: string) => {
            return chatRepo.countUnreadMessages(userId);
        },
        updateUserOnlineStatus: (userId: string, isOnline: boolean) => {
            return chatRepo.updateUserOnlineStatus(userId, isOnline);
        },
        checkUserInRoom: (userId: string, roomId: string) => {
            return chatRepo.checkUserInRoom(userId, roomId);
        },
        checkMessageIsRead: (messageId: string, userId: string) => {
            return chatRepo.checkMessageIsRead(messageId, userId);
        },
        getMessageById: (messageId: string) => {
            return chatRepo.getMessageById(messageId);
        },
        getAllParticipantsInRoom: (roomId: string) => {
            return chatRepo.getAllParticipantsInRoom(roomId);
        },
        getRoomById: (roomId: string) => {
            return chatRepo.getRoomById(roomId);
        },
        markAllMessageAsRead: (roomId: string, userId: string) => {
            return chatRepo.markAllMessageAsRead(roomId, userId);
        }

    }
}