import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { eq, and } from 'drizzle-orm';
import { userService } from '../service/user.service';

interface ChatSocket {
    userId: string;
    socketId: string;
    rooms: string[];
}

interface MessageData {
    roomId: string;
    content: string;
    messageType?: 'text' | 'image' | 'file';
    attachments?: Array<{
        name: string;
        url: string;
        type: 'image' | 'document' | 'video' | 'audio';
        size?: number;
    }>;
}

interface TypingData {
    roomId: string;
    isTyping: boolean;
}

// Module state
let io: SocketIOServer;
const connectedUsers: Map<string, ChatSocket> = new Map();


// Database instance (import your db instance here)
import { chatParticipant } from '../schema/chat-schema';
import { db } from '../db/db';
import { userRepo } from '../repository/user.repo';
import { chatRepo } from '../repository/chat.repo';
import { chatService } from '../service/chat.service';
// Initialize socket server

const chatInstance = chatService(chatRepo);
const userInstance = userService(userRepo);

export const initializeSocketServer = (server: HTTPServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: ['https://www.travana.app',
                'http://localhost:4200',
                'http://localhost:5173',
                'https://travana-client.onrender.com',
                'https://travana-client-dev.onrender.com',
                'https://travana-referral.onrender.com',
                'https://referral-dev.travana.app',
                'https://www.referral-dev.travana.app',
                'https://dev-travana-client.travana.app',
                'https://www.dev-travana-client.travana.app'],
            credentials: true,
        },
    });

    setupEventHandlers();
};


// Setup event handlers
const setupEventHandlers = () => {
    io.on('connection', (socket) => {

        // Authenticate user and join their rooms
        socket.on('authenticate', async (data: { userId: string }) => {
            try {
                const { userId } = data;

                const user = await userInstance.fetchUserById(userId);

                if (!user) {
                    socket.emit('error', { message: 'User not found' });
                    return;
                }

                // Get user's chat rooms
                const rooms = await chatInstance.getRooms(userId, { limit: '20', cursor: undefined, search: undefined, type: 'all', unreadOnly: undefined, userId: undefined });

                const roomIds = rooms.rooms.map(room => room.id);

                connectedUsers.set(socket.id, {
                    userId,
                    socketId: socket.id,
                    rooms: roomIds,
                });

                // Join user to their personal room for targeted notifications
                socket.join(`user:${userId}`);

                // Join user to their chat rooms
                roomIds.forEach(roomId => {
                    socket.join(roomId);
                });

                // Update user's online status
                await chatInstance.updateUserOnlineStatus(userId, true);


                // Notify other users in the same rooms
                roomIds.forEach(roomId => {
                    socket.to(roomId).emit('user_online', {
                        userId,
                        roomId,
                        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User'
                    });
                });

                socket.emit('authenticated', {
                    userId,
                    rooms: roomIds,
                    message: 'Successfully authenticated'
                });

            } catch (error) {
                console.error('Authentication error:', error);
                socket.emit('error', { message: 'Authentication failed' });
            }
        });

        // Handle joining a room
        socket.on('join_room', async (data: { roomId: string,participantsId: string[] }) => {
            try {
                console.log('Join room request received:', data);
                const userSocket = connectedUsers.get(socket.id);
                if (!userSocket) {
                    socket.emit('error', { message: 'User not authenticated' });
                    return;
                }
                const { roomId } = data;
                // Check if user is a participant
                

                const participant = await chatInstance.checkUserInRoom(userSocket.userId, roomId);

                if (!participant) {
                    socket.emit('error', { message: 'Access denied to room' });
                    return;
                }

                // Join the room
                socket.join(roomId);
                userSocket.rooms.push(roomId);

                socket.emit('room_joined', { roomId });
                socket.to(roomId).emit('user_joined_room', {
                    userId: userSocket.userId,
                    roomId
                });

            } catch (error) {
                console.error('Join room error:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Handle leaving a room
        socket.on('leave_room', async (data: { roomId: string }) => {
            try {
                const userSocket = connectedUsers.get(socket.id);
                if (!userSocket) {
                    socket.emit('error', { message: 'User not authenticated' });
                    return;
                }

                const { roomId } = data;

                // Leave the room
                socket.leave(roomId);
                userSocket.rooms = userSocket.rooms.filter(id => id !== roomId);

                socket.emit('room_left', { roomId });
                socket.to(roomId).emit('user_left_room', {
                    userId: userSocket.userId,
                    roomId
                });

            } catch (error) {
                console.error('Leave room error:', error);
                socket.emit('error', { message: 'Failed to leave room' });
            }
        });

        // Handle sending a message
        socket.on('send_message', async (data: MessageData) => {
            try {
                const userSocket = connectedUsers.get(socket.id);
                if (!userSocket) {
                    socket.emit('error', { message: 'User not authenticated' });
                    return;
                }

                const { roomId, content, messageType, attachments } = data;

                // Check if user is a participant
                const participant = await db.query.chatParticipant.findFirst({
                    where: and(
                        eq(chatParticipant.roomId, roomId),
                        eq(chatParticipant.participantId, userSocket.userId)
                    ),
                });

                if (!participant) {
                    socket.emit('error', { message: 'Access denied to room' });
                    return;
                }

                // Save message to database

                const message = await chatRepo.sendMessage({
                    roomId,
                    senderId: userSocket.userId,
                    content,
                    messageType,
                    attachments,
                }, roomId);


                // Get sender info
                const user = await userInstance.fetchUserById(userSocket.userId);


                if (!user) {
                    socket.emit('error', { message: 'Sender not found' });
                    return;
                }

                const messageData = {
                    id: message.id,
                    content: message.content,
                    senderId: message.senderId,
                    senderName: `${user.firstName} ${user.lastName}`,
                    senderAvatar: undefined, // avatar field doesn't exist in user schema
                    timestamp: new Date(message.timestamp).toISOString(),
                    isRead: message.isRead,
                    messageType: message.messageType,
                    roomId: message.roomId,
                    attachments: message.attachments,
                };

                // Broadcast message to all users in the room

                io.to(roomId).emit('new_message', messageData);

                // Emit confirmation to sender
                socket.emit('message_sent', { messageId: message.id });

            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle typing indicators
        socket.on('typing', (data: TypingData) => {
            const userSocket = connectedUsers.get(socket.id);
            if (!userSocket) return;

            const { roomId, isTyping } = data;
            socket.to(roomId).emit('user_typing', {
                userId: userSocket.userId,
                roomId,
                isTyping,
            });
        });

        // Ticket events
        socket.on('ticket_created', (data: { ticketId: string; agentId: string; subject: string; createdBy: string }) => {
            // Emit to all connected users (or specific users based on your requirements)
            io.emit('new_ticket', data);
        });

        socket.on('ticket_assigned', (data: { ticketId: string; agentId: string; assignedBy: string }) => {
            // Emit to the assigned agent specifically
            io.emit('ticket_assigned', data);
        });

        socket.on('ticket_status_updated', (data: { ticketId: string; status: string; updatedBy: string }) => {
            io.emit('ticket_status_updated', data);
        });

        socket.on('ticket_reply_added', (data: { ticketId: string; replyId: string; agentId: string; content: string }) => {
            io.emit('ticket_reply_added', data);
        });

        // Handle marking message as read
        socket.on('mark_message_read', async (data: { messageId: string }) => {
            try {
                const userSocket = connectedUsers.get(socket.id);
                if (!userSocket) {
                    socket.emit('error', { message: 'User not authenticated' });
                    return;
                }

                const { messageId } = data;

                // Check if already read


                const existingRead = await chatRepo.checkMessageIsRead(messageId, userSocket.userId);

                if (!existingRead) {
                    // Mark as read

                    await chatRepo.markMessageAsRead(messageId, { userId: userSocket.userId, messageId });

                    // Get message to find room
                    const message = await chatRepo.getMessageById(messageId);

                    if (message) {
                        // Notify other users in the room
                        socket.to(message.roomId).emit('message_read', {
                            messageId,
                            userId: userSocket.userId,
                            roomId: message.roomId,
                        });
                    }
                }

                socket.emit('message_marked_read', { messageId });

            } catch (error) {
                console.error('Mark message read error:', error);
                socket.emit('error', { message: 'Failed to mark message as read' });
            }
        });

        // Handle joining all participants to a room (called after room creation)
        socket.on('join_all_participants_to_room', async (data: { roomId: string }) => {
            try {
                const userSocket = connectedUsers.get(socket.id);
                if (!userSocket) {
                    socket.emit('error', { message: 'User not authenticated' });
                    return;
                }

                const { roomId } = data;


                // Get all participants for this room
                const participants = await chatInstance.getAllParticipantsInRoom(roomId);


                // Get all connected users
                const connectedUserIds = Array.from(connectedUsers.values()).map(user => user.userId);

                // Find which participants are currently connected
                const connectedParticipants = participants.filter(participant =>
                    connectedUserIds.includes(participant.id)
                );


                // Join each connected participant to the room
                for (const participant of connectedParticipants) {
                    // Find the socket for this user
                    const userSocket = Array.from(connectedUsers.entries()).find(
                        ([_, user]) => user.userId === participant.id
                    );

                    if (userSocket) {
                        const [socketId, userData] = userSocket;
                        const participantSocket = io.sockets.sockets.get(socketId);

                        if (participantSocket) {
                            try {
                                // Join the socket to the room
                                participantSocket.join(roomId);

                                // Update the user's rooms list
                                if (!userData.rooms.includes(roomId)) {
                                    userData.rooms.push(roomId);
                                }


                                // Get room info

                                const room = await chatRepo.getRoomById(roomId);

                                // Notify the user that they've been added to a new room
                                participantSocket.emit('room_created', {
                                    roomId,
                                    roomName: room?.name || 'New Room',
                                    participants: participants.map(p => ({
                                        userId: p.id,
                                        userName: p.firstName ? `${p.firstName} ${p.lastName}` : 'Unknown User'
                                    }))
                                });

                            } catch (error) {
                                console.error(`Failed to join user ${participant.id} to room ${roomId}:`, error);
                            }
                        }
                    }
                }

                // Notify all participants in the room about the new room
                io.to(roomId).emit('room_participants_updated', {
                    roomId,
                    participants: participants.map(p => ({
                        userId: p.id,
                        userName: p.firstName ? `${p.firstName} ${p.lastName}` : 'Unknown User',
                        isOnline: connectedUserIds.includes(p.id)
                    }))
                });


                // Send success response to the caller
                socket.emit('participants_joined_room', {
                    roomId,
                    participantsCount: connectedParticipants.length,
                    message: 'All participants joined the room successfully'
                });

            } catch (error) {
                console.error(`Error joining participants to room :`, error);
                socket.emit('error', { message: 'Failed to join participants to room' });
            }
        });

        // Handle disconnection
        socket.on('disconnect', async () => {

            const userSocket = connectedUsers.get(socket.id);
            if (userSocket) {
                // Update user's online status

                await chatInstance.updateUserOnlineStatus(userSocket.userId, false);

                // Get user info for notifications
                const user = await userInstance.fetchUserById(userSocket.userId);

                // Notify other users in the same rooms
                userSocket.rooms.forEach(roomId => {
                    socket.to(roomId).emit('user_offline', {
                        userId: userSocket.userId,
                        roomId,
                        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User'
                    });
                });

                connectedUsers.delete(socket.id);
            }
        });
    });
};

// Get connected users for a room
export const getConnectedUsersInRoom = (roomId: string): string[] => {
    const users: string[] = [];
    connectedUsers.forEach((userSocket) => {
        if (userSocket.rooms.includes(roomId)) {
            users.push(userSocket.userId);
        }
    });
    return users;
};

// Send system message to a room
export const sendSystemMessage = (roomId: string, content: string) => {
    io.to(roomId).emit('system_message', {
        roomId,
        content,
        timestamp: new Date().toISOString(),
    });
};

// Broadcast to all users
export const broadcastToAll = (event: string, data: any) => {
    io.emit(event, data);
};

// Get socket instance (for advanced usage)
export const getSocketInstance = () => io;

// Emit to specific user(s)
export const emitToUser = (userId: string | string[], event: string, data: any) => {
    if (!io) return;
    
    const userIds = Array.isArray(userId) ? userId : [userId];
    userIds.forEach(id => {
        if (id) {
            io.to(`user:${id}`).emit(event, data);
        }
    });
};

// Utility functions to emit ticket events from other parts of the application
export const emitTicketCreated = (data: { ticketId: string; agentId: string; subject: string; createdBy: string }) => {
    if (!io) return;
    
    const recipients: string[] = [];
    
    // Notify assigned agent
    if (data.agentId) {
        recipients.push(data.agentId);
    }
    
    // Notify creator
    if (data.createdBy && data.createdBy !== data.agentId) {
        recipients.push(data.createdBy);
    }
    
    // Emit to specific users
    recipients.forEach(userId => {
        io.to(`user:${userId}`).emit('new_ticket', data);
    });
};

export const emitTicketAssigned = (data: { ticketId: string; agentId: string; assignedBy: string }) => {
    if (!io) return;
    
    // Notify the assigned agent
    if (data.agentId) {
        io.to(`user:${data.agentId}`).emit('ticket_assigned', data);
    }
};

export const emitTicketStatusUpdated = (data: { ticketId: string; status: string; updatedBy: string; agentId?: string; createdBy?: string }) => {
    if (!io) return;
    
    const recipients: string[] = [];
    
    // Notify assigned agent
    if (data.agentId) {
        recipients.push(data.agentId);
    }
    
    // Notify creator
    if (data.createdBy && data.createdBy !== data.updatedBy) {
        recipients.push(data.createdBy);
    }
    
    // Emit to specific users
    recipients.forEach(userId => {
        io.to(`user:${userId}`).emit('ticket_status_updated', data);
    });
};

export const emitTicketReplyAdded = (data: { ticketId: string; replyId: string; agentId: string; content: string; createdBy?: string; repliedBy: string }) => {
    if (!io) return;
    
    const recipients: string[] = [];
    
    // Notify assigned agent (if reply is not from agent)
    if (data.agentId && data.agentId !== data.repliedBy) {
        recipients.push(data.agentId);
    }
    
    // Notify ticket creator (if reply is not from creator)
    if (data.createdBy && data.createdBy !== data.repliedBy) {
        recipients.push(data.createdBy);
    }
    
    // Emit to specific users
    recipients.forEach(userId => {
        io.to(`user:${userId}`).emit('ticket_reply_added', data);
    });
};
export const emitMessageRead = (data: { messageId: string[]; userId: string; roomId: string }) => {
    if (io) {
        io.to(data.roomId).emit('message_read', data);
    }
};