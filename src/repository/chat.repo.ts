import { db } from "../db/db"
import { AppError } from "../middleware/errorHandler"
import { chatMessage, chatMessageRead, chatParticipant, chatRoom } from "../schema/chat-schema"
import { user } from "../schema/auth-schema"
import { chatFiltersQuerySchema, chatMessageQuerySchema, chatMessagesQuerySchema, chatRoomQuerySchema, createRoomMutationSchema, joinRoomMutationSchema, leaveRoomMutationSchema, markMessageAsReadMutationSchema, sendMessageMutationSchema, updateRoomMutationSchema } from "../types/modules/chat"
import { and, eq, ne, inArray, sql, desc, ilike } from "drizzle-orm"
import { count } from "drizzle-orm/sql/functions/aggregate"
import z from "zod"


export type ChatRepo = {
    getRooms: (userId: string, filters: z.infer<typeof chatFiltersQuerySchema>, limit?: string, cursor?: string) => Promise<{
        rooms: z.infer<typeof chatRoomQuerySchema>[];
        hasMore: boolean;
        nextCursor?: string;
    }>
    getRoom: (roomId: string, userId: string) => Promise<z.infer<typeof chatRoomQuerySchema>>
    getMessages: (filters: z.infer<typeof chatMessagesQuerySchema>, roomId: string) => Promise<{
        messages: z.infer<typeof chatMessageQuerySchema>[];
        hasMore: boolean;
        nextCursor?: string;
    }>
    sendMessage: (data: z.infer<typeof sendMessageMutationSchema>, roomId: string) => Promise<z.infer<typeof chatMessageQuerySchema>>
    createRoom: (data: z.infer<typeof createRoomMutationSchema>, creatorId: string) => Promise<z.infer<typeof chatRoomQuerySchema>>
    joinRoom: (data: z.infer<typeof joinRoomMutationSchema>) => Promise<{ message: string }>
    leaveRoom: (id: string, data: z.infer<typeof leaveRoomMutationSchema>) => Promise<{ message: string }>
    markMessageAsRead: (messageId: string, data: z.infer<typeof markMessageAsReadMutationSchema>) => Promise<{ message: string }>
    updateRoom: (roomId: string, data: z.infer<typeof updateRoomMutationSchema>, userId: string) => Promise<z.infer<typeof chatRoomQuerySchema>>
    deleteRoom: (userId: string, roomId: string) => Promise<void>
    countUnreadMessages: (userId: string) => Promise<number>
    updateUserOnlineStatus: (userId: string, isOnline: boolean) => Promise<void>
    checkUserInRoom: (userId: string, roomId: string) => Promise<boolean>
    checkMessageIsRead: (messageId: string, userId: string) => Promise<boolean>
    getMessageById: (messageId: string) => Promise<z.infer<typeof chatMessageQuerySchema> | null | undefined>
    getAllParticipantsInRoom: (roomId: string) => Promise<{
        id: string;
        firstName: string
        lastName: string
    }[]>
    getRoomById: (roomId: string) => Promise<z.infer<typeof chatRoomQuerySchema> | null | undefined>
    markAllMessageAsRead: (roomId: string, userId: string) => Promise<void>;
}

export const chatRepo: ChatRepo = {
    markAllMessageAsRead: async (roomId, userId) => {
        await db.update(chatMessage)
            .set({ isRead: true })
            .where(and(
                eq(chatMessage.roomId, roomId),
                eq(chatMessage.sender_id, userId),
                eq(chatMessage.isRead, false)
            ));
    },
    getRoomById: async (roomId) => {
        const room = await db.query.chatRoom.findFirst({
            where: eq(chatRoom.id, roomId),
        });
        return room ? {
            ...room,
            name: room?.name || 'No name',
            type: room.type as "direct" | "group",
            isActive: room.isActive ?? false,
            createdAt: room.createdAt?.toISOString() || 'No date',
            updatedAt: room.updatedAt?.toISOString() || 'No date',
        } : null;
    },
    getAllParticipantsInRoom: async (roomId) => {
        const participants = await db.query.chatParticipant.findMany({
            columns: {
                participantId: true

            },
            with: {
                user_v2: true
            },

            where: eq(chatParticipant.roomId, roomId)
        });

        return participants.map(p => ({
            id: p.participantId!,
            firstName: p.user_v2?.firstName!,
            lastName: p.user_v2?.lastName!
        }));
    },
    getMessageById: async (messageId) => {
        const response = await db.query.chatMessage.findFirst({
            where: eq(chatMessage.id, messageId),
            with: {
                sender_v2: true
            }
        });

        if (!response) return null;

        return {
            id: response.id ?? '',
            content: response.content ?? 'No content',
            senderId: response.sender_id ?? 'No sender',
            senderName: response.sender_v2 ? `${response.sender_v2.firstName} ${response.sender_v2.lastName}` : 'No sender',
            timestamp: response.timestamp ? response.timestamp.toISOString() : 'No date',
            isRead: response.isRead ?? false,
            messageType: response.messageType as "text" | "image" | "file" | "system",
            roomId: response.roomId ?? 'No room',
            attachments: response.attachments && response.attachments.length > 0 ? response.attachments : [],
        };
    },
    checkMessageIsRead: async (messageId, userId) => {
        const readStatus = await db.query.chatMessageRead.findFirst({
            where: and(
                eq(chatMessageRead.messageId, messageId),
                eq(chatMessageRead.user_id_v2, userId)
            ),
        });
        return !!readStatus;
    },
    checkUserInRoom: async (userId, roomId) => {
        const participant = await db.query.chatParticipant.findFirst({
            where: and(
                eq(chatParticipant.participantId, userId),
                eq(chatParticipant.roomId, roomId)
            ),
        });
        return !!participant;
    },
    updateUserOnlineStatus: async (userId, isOnline) => {
        await db
            .update(chatParticipant)
            .set({
                isOnline,
                lastSeen: isOnline ? undefined : new Date(),
            })
            .where(eq(chatParticipant.participantId, userId));
    },
    getRooms: async (userId, filters, limit, cursor) => {
        const limitNum = limit ? parseInt(limit) : 50;
        const whereConditions = [eq(chatRoom.isActive, true)];

        if (cursor) {
            whereConditions.push(sql`${chatRoom.updatedAt} < (SELECT updated_at FROM chat_rooms WHERE id = ${cursor})`);
        }

        if (filters.search) {
            whereConditions.push(ilike(chatRoom.name, `%${filters.search}%`));
        }

        if (filters.type && filters.type !== 'all') {
            whereConditions.push(eq(chatRoom.type, filters.type));
        }

        const rooms = await db.query.chatRoom.findMany({
            where: and(...whereConditions),
            with: {
                participants: {
                    with: {
                        user_v2: true,
                    },
                },
                messages: {
                    orderBy: [desc(chatMessage.timestamp)],
                    limit: 1,
                    with: {
                        sender_v2: true,
                    },
                },
            },
            orderBy: [desc(chatRoom.updatedAt)],
            limit: limitNum + 1, // +1 to check if there are more rooms
        });
        // Filter rooms where user is a participant
        const userRooms = rooms.filter(room =>
            room.participants.some(participant => participant.participantId === userId)
        );

        // Calculate unread counts
        const roomsWithUnreadCounts = await Promise.all(
            userRooms.map(async (room) => {
                const unreadCount = await db
                    .select({ count: count() })
                    .from(chatMessage)
                    .where(
                        and(
                            eq(chatMessage.roomId, room.id),
                            ne(chatMessage.sender_id, userId),
                            eq(chatMessage.isRead, false)
                        )
                    );

                return {
                    ...room,
                    isActive: room.isActive ?? false,
                    type: room.type as "direct" | "group",
                    unreadCount: unreadCount[0].count,
                    timestamp: room.updatedAt?.toISOString() ?? "No date",
                    participants: room.participants.map(p => ({
                        id: p.participantId!,
                        name: `${p.user_v2?.firstName} ${p.user_v2?.lastName}`,
                        isOnline: p.isOnline ?? false,
                        lastSeen: p.lastSeen?.toISOString(),
                        role: p.role as "admin" | "member",
                    })),
                    lastMessage: room.messages[0] ? {
                        id: room.messages[0].id,
                        content: room.messages[0].content || 'No content',
                        senderId: room.messages[0].sender_id || 'No sender',
                        senderName: `${room.messages[0].sender_v2?.firstName} ${room.messages[0].sender_v2?.lastName}`,
                        timestamp: room.messages[0].timestamp?.toISOString() || "No date",
                        isRead: room.messages[0].isRead || false,
                        messageType: room.messages[0].messageType as "text" | "image" | "file" | "system",
                        roomId: room.messages[0].roomId || 'No room',
                        attachments: room.messages[0].attachments && room.messages[0].attachments.length > 0 ? room.messages[0].attachments : [],
                    } : undefined,
                    // For direct messages, show the other person's name
                    name: room.type === 'direct'
                        ? room.participants?.find(p => p.participantId !== userId)?.user_v2
                            ? room?.participants?.find(p => p.participantId !== userId)?.user_v2
                                ? `${room.participants.find(p => p.participantId !== userId)!.user_v2!.firstName} ${room.participants.find(p => p.participantId !== userId)!.user_v2!.lastName}`
                                : room.name ?? 'No name'
                            : room.name ?? 'No name'
                        : room.name ?? 'No name',
                    createdAt: room.createdAt?.toISOString() ?? "No date",
                    updatedAt: room.updatedAt?.toISOString() ?? "No date",
                };
            })
        );

        // Apply unreadOnly filter
        let filteredRooms = roomsWithUnreadCounts;
        if (filters.unreadOnly) {
            filteredRooms = roomsWithUnreadCounts.filter(room => room.unreadCount > 0);
        }

        const hasMore = filteredRooms.length > limitNum;
        const roomsToReturn = hasMore ? filteredRooms.slice(0, limitNum) : filteredRooms;
        const nextCursor = hasMore ? filteredRooms[limitNum - 1].id : undefined;

        return {
            rooms: roomsToReturn,
            hasMore,
            nextCursor,
        };
    },
    getRoom: async (roomId, userId) => {
        const room = await db.query.chatRoom.findFirst({
            where: eq(chatRoom.id, roomId),
            with: {
                participants: {
                    with: {
                        user_v2: true,
                    },
                },
                messages: {
                    orderBy: [desc(chatMessage.timestamp)],
                    limit: 1,
                    with: {
                        sender_v2: true,
                    },
                },
            },
        });

        if (!room) {
            throw new AppError('Chat room not found', true, 404);
        }

        // Check if user is a participant
        const isParticipant = room.participants.some(p => p.participantId === userId);
        if (!isParticipant) {
            throw new AppError('Access denied', true, 403);
        }

        const unreadCount = await db
            .select({ count: count() })
            .from(chatMessage)
            .where(
                and(
                    eq(chatMessage.roomId, roomId),
                    ne(chatMessage.sender_id, userId),
                    eq(chatMessage.isRead, false)
                )
            );

        return {
            id: room.id,
            // For direct messages, show the other person's name
            name: room.type === 'direct'
                ? room.participants?.find(p => p.participantId !== userId)?.user_v2
                    ? room?.participants?.find(p => p.participantId !== userId)?.user_v2
                        ? `${room.participants.find(p => p.participantId !== userId)!.user_v2!.firstName} ${room.participants.find(p => p.participantId !== userId)!.user_v2!.lastName}`
                        : room.name ?? 'No name'
                    : room.name ?? 'No name'
                : room.name ?? 'No name',
            type: room.type as "direct" | "group",
            participants: room.participants.map(p => ({
                id: p.participantId!,
                name: `${p.user_v2?.firstName} ${p.user_v2?.lastName}`,
                isOnline: p.isOnline ?? false,
                lastSeen: p.lastSeen?.toISOString(),
                role: p.role as "admin" | "member",
            })),
            lastMessage: room.messages[0] ? {
                id: room.messages[0].id,
                content: room.messages[0].content || 'No content',
                senderId: room.messages[0].sender_id || 'No sender',
                senderName: `${room.messages[0].sender_v2?.firstName} ${room.messages[0].sender_v2?.lastName}`,
                timestamp: room.messages[0].timestamp?.toISOString() ?? "No date",
                isRead: room.messages[0].isRead || false,
                messageType: room.messages[0].messageType as "text" | "image" | "file" | "system",
                roomId: room.messages[0].roomId || 'No room',
                attachments: room.messages[0].attachments && room.messages[0].attachments.length > 0 ? room.messages[0].attachments : [],
            } : undefined,
            unreadCount: unreadCount[0].count,
            isActive: room.isActive ?? false,
            createdAt: room.createdAt?.toISOString() ?? "No date",
            updatedAt: room.updatedAt?.toISOString() ?? "No date",
        };
    },
    getMessages: async (filters, roomId) => {


        const participant = await db.query.chatParticipant.findFirst({
            where: and(
                eq(chatParticipant.roomId, roomId),
                eq(chatParticipant.participantId, filters.userId || '')
            ),
        });

        if (!participant) {
            throw new AppError('Access denied', true, 403);
        }

        const limitNum = filters.limit ? parseInt(filters.limit) : 50;
        const whereConditions = [eq(chatMessage.roomId, roomId)];

        if (filters.cursor) {
            whereConditions.push(sql`${chatMessage.timestamp} < (SELECT timestamp FROM chat_messages WHERE id = ${filters.cursor})`);
        }

        const messages = await db.query.chatMessage.findMany({
            where: and(...whereConditions),
            with: {
                sender_v2: true,
                reads: {
                    with: {
                        user_v2: true,
                    },
                },
            },
            orderBy: [desc(chatMessage.timestamp)], // Changed to descending order for proper pagination
            limit: limitNum + 1, // +1 to check if there are more messages
        });

        const hasMore = messages.length > limitNum;
        const messagesToReturn = hasMore ? messages.slice(0, limitNum) : messages;
        const nextCursor = hasMore ? messages[limitNum - 1].id : undefined;

        return {
            messages: messagesToReturn.map(msg => ({
                id: msg.id,
                content: msg.content || 'No content',
                senderId: msg.sender_id || 'No sender',
                senderName: `${msg.sender_v2?.firstName} ${msg.sender_v2?.lastName}`,
                timestamp: msg.timestamp?.toISOString() || "No date",
                isRead: msg.isRead || false,
                roomId: msg.roomId || 'No room',
                attachments: msg.attachments || [],
                messageType: msg.messageType as "text" | "image" | "file" | "system",
            })),
            hasMore,
            nextCursor,
        };
    },
    sendMessage: async (data, roomId) => {

        const participant = await db.query.chatParticipant.findFirst({
            where: and(
                eq(chatParticipant.roomId, roomId),
                eq(chatParticipant.participantId, data.senderId)
            ),
        });

        if (!participant) {
            throw new AppError('Access denied', true, 403);
        }

        const [message] = await db
            .insert(chatMessage)
            .values({
                roomId: roomId,
                sender_id: data.senderId,
                content: data.content,
                attachments: data.attachments?.map(data => ({ ...data, id: data.url })),
            })
            .returning({
                id: chatMessage.id,
                content: chatMessage.content,
                sender_id: chatMessage.sender_id,
                messageType: chatMessage.messageType,
                roomId: chatMessage.roomId,
                attachments: chatMessage.attachments,
                isRead: chatMessage.isRead,
                timestamp: chatMessage.timestamp,
            });

        // Update room's updatedAt timestamp
        await db
            .update(chatRoom)
            .set({ updatedAt: new Date() })
            .where(eq(chatRoom.id, data.roomId));

        // Get sender info
        const sender = await db.query.user.findFirst({
            where: eq(user.id, data.senderId),
        });

        if (!sender) {
            throw new AppError('Sender not found', true, 404);
        }

        return {
            id: message.id,
            content: message.content || 'No content',
            senderId: message.sender_id || 'No sender',
            senderName: `${sender.firstName} ${sender.lastName}`,
            timestamp: message.timestamp?.toISOString() || "No date",
            isRead: message.isRead || false,
            messageType: message.messageType as "text" | "image" | "file" | "system",
            roomId: message.roomId || 'No room',
            attachments: message.attachments && message.attachments.length > 0 ? message.attachments : [],
        };
    },
    createRoom: async (data, creatorId) => {


        // Validate participants exist - fix the array query
        const participants = await db.query.user.findMany({
            where: inArray(user.id, data.participantIds),
        });


        if (participants.length !== data.participantIds.length) {
            throw new AppError('Some participants not found', true, 400);
        }

        // Generate room name based on participants
        let roomName = data.name;
        if (data.type === 'direct') {
            // For direct messages, find the other user (not the creator)
            const otherUser = participants.find(p => p.id !== creatorId);
            if (otherUser) {
                roomName = `${otherUser.firstName} ${otherUser.lastName}`;
            }
        } else {
            // For group messages, use the provided name or generate one
            if (!roomName || roomName === 'New Group') {
                const otherUsers = participants.filter(p => p.id !== creatorId);
                const userNames = otherUsers.map(u => `${u.firstName} ${u.lastName}`);
                roomName = userNames.join(', ');
            }
        }


        // Create room
        const [room] = await db
            .insert(chatRoom)
            .values({
                name: roomName,
                type: data.type,
            })
            .returning();


        // Add participants
        const participantData = data.participantIds.map((userId, index) => ({
            roomId: room.id,
            participantId: userId,
            role: index === 0 ? 'admin' : 'member', // First participant is admin
        }));


        await db.insert(chatParticipant).values(participantData);

        // Get room with participants
        const roomWithParticipants = await db.query.chatRoom.findFirst({
            where: eq(chatRoom.id, room.id),
            with: {
                participants: {
                    with: {
                        user_v2: true,
                    },
                },
            },
        });

        if (!roomWithParticipants) {
            throw new AppError('Failed to create room', true, 500);
        }

        return {
            id: roomWithParticipants.id,
            name: roomWithParticipants.name ?? 'No name',
            type: roomWithParticipants.type as "direct" | "group",
            participants: roomWithParticipants.participants.map(p => ({
                id: p.participantId!,
                name: `${p.user_v2?.firstName} ${p.user_v2?.lastName}`,
                isOnline: p.isOnline ?? false,
                lastSeen: p.lastSeen?.toISOString(),
                role: p.role as "admin" | "member",
            })),
            unreadCount: 0,
            isActive: roomWithParticipants.isActive ?? false,
            createdAt: roomWithParticipants.createdAt?.toISOString() ?? "No date",
            updatedAt: roomWithParticipants.updatedAt?.toISOString() ?? "No date",
        };
    },
    joinRoom: async (data) => {
        const existingParticipant = await db.query.chatParticipant.findFirst({
            where: and(
                eq(chatParticipant.roomId, data.roomId),
                eq(chatParticipant.participantId, data.userId)
            ),
        });

        if (existingParticipant) {
            return { message: 'User already in the room' };
        }

        await db.insert(chatParticipant).values({
            roomId: data.roomId,
            participantId: data.userId,
            role: 'member',
        });

        return { message: 'Successfully joined room' };
    },
    leaveRoom: async (id, data) => {
        const result = await db
            .delete(chatParticipant)
            .where(
                and(
                    eq(chatParticipant.roomId, data.roomId),
                    eq(chatParticipant.participantId, data.userId)
                )
            )
            .returning();

        if (result.length === 0) {
            return { message: 'User was not in the room' };
        }

        return { message: 'Successfully left room' };
    },
    markMessageAsRead: async (messageId, data) => {
        const existingRead = await db.query.chatMessageRead.findFirst({
            where: and(
                eq(chatMessageRead.messageId, messageId),
                eq(chatMessageRead.user_id_v2, data.userId)
            ),
        });

        if (existingRead) {
            return { message: 'Message already marked as read' };
        }

        await db.insert(chatMessageRead).values({
            messageId: data.messageId,
            user_id_v2: data.userId,
        });

        // Update message read status
        await db
            .update(chatMessage)
            .set({ isRead: true })
            .where(eq(chatMessage.id, data.messageId));

        return { message: 'Message marked as read' };
    },
    updateRoom: async (roomId, data, userId) => {
        const participant = await db.query.chatParticipant.findFirst({
            where: and(
                eq(chatParticipant.roomId, roomId),
                eq(chatParticipant.participantId, userId)
            ),
        });

        if (!participant || participant.role !== 'admin') {
            throw new AppError('Only admins can update rooms', true, 403);
        }

        const updateData: any = { updatedAt: new Date() };
        if (data.name !== undefined) updateData.name = data.name;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const [updatedRoom] = await db
            .update(chatRoom)
            .set(updateData)
            .where(eq(chatRoom.id, roomId))
            .returning();

        if (!updatedRoom) {
            throw new AppError('Room not found', true, 404);
        }

        // Get room with participants
        const roomWithParticipants = await db.query.chatRoom.findFirst({
            where: eq(chatRoom.id, roomId),
            with: {
                participants: {
                    with: {
                        user_v2: true,
                    },
                },
            },
        });

        if (!roomWithParticipants) {
            throw new AppError('Failed to fetch updated room', true, 500);
        }

        return {
            id: roomWithParticipants.id,
            name: roomWithParticipants.name ?? 'No name',
            type: roomWithParticipants.type as "direct" | "group",
            participants: roomWithParticipants.participants.map(p => ({
                id: p.participantId!,
                name: `${p?.user_v2?.firstName} ${p?.user_v2?.lastName}`,
                isOnline: p?.isOnline ?? false,
                lastSeen: p?.lastSeen?.toISOString(),
                role: p?.role as "admin" | "member",
            })),
            unreadCount: 0, // This would need to be calculated
            isActive: roomWithParticipants.isActive ?? false,
            createdAt: roomWithParticipants?.createdAt?.toISOString() ?? "No date",
            updatedAt: roomWithParticipants?.updatedAt?.toISOString() ?? "No date",
        };
    },
    deleteRoom: async (userId, roomId) => {
        const participant = await db.query.chatParticipant.findFirst({
            where: and(
                eq(chatParticipant.roomId, roomId),
                eq(chatParticipant.participantId, userId)
            ),
        });

        if (!participant || participant.role !== 'admin') {
            throw new AppError('Only admins can delete rooms', true, 403);
        }

        await db.delete(chatRoom).where(eq(chatRoom.id, roomId));

    },
    countUnreadMessages: async (userId) => {
        const userRooms = await db.query.chatRoom.findMany({
            where: (room, { and, eq }) => and(eq(room.isActive, true)),
            with: {
                participants: {
                    where: (participant, { eq }) => eq(participant.participantId, userId),
                },
            },
        });

        // Filter rooms where user is actually a participant
        const rooms = userRooms.filter(room => room.participants.length > 0);

        // Count unread messages across all rooms
        let totalUnreadCount = 0;

        for (const room of rooms) {
            const unreadCount = await db
                .select({ count: count() })
                .from(chatMessage)
                .where(
                    and(
                        eq(chatMessage.roomId, room.id),
                        ne(chatMessage.sender_id, userId),
                        eq(chatMessage.isRead, false)
                    )
                );

            totalUnreadCount += unreadCount[0].count;
        }

        return totalUnreadCount;
    }
}