import { eq } from 'drizzle-orm';
import { db } from '../src/db/db';
import { auth } from '../src/lib/auth';
import { transaction } from '../src/schema/transactions-schema';
import { ticket, ticket_reply } from '../src/schema/ticket-schema';
import { task } from '../src/schema/task-schema';
import { agentTargetTable } from '../src/schema/agent-target-schema';
import { booking } from '../src/schema/booking-schema';
import { chatMessage, chatMessageRead, chatParticipant } from '../src/schema/chat-schema';
import { notes, todos } from '../src/schema/note-schema';
import { notification, notification_token } from '../src/schema/notification-schema';
import { user } from '../src/schema/auth-schema';

export const migrateUser = async () => {
  try {
    await db.transaction(async (tx) => {
      const users = await tx.query.usersTable.findMany({});

      for (const user1 of users) {
            if(user.email === null) {
                continue;
            }
        const response = await auth.api.signUpEmail({
          body: {
            email: user1.email!,
            password: "travana@123",
            firstName: user1.firstName!,
            lastName: user1.lastName!,
            phoneNumber: user1.phoneNumber!,
            name: `${user1.firstName!} ${user1.lastName!}`,
            role: "USER",
          },
        });
        if (!response) {
          continue;
        }
        await tx
          .update(transaction)
          .set({
            user_id: response.user.id,
          })
          .where(eq(transaction.agent_id, user1.id));

        await tx
          .update(task)
          .set({
            user_id: response.user.id,
          })
          .where(eq(task.agent_id, user1.id));

        await tx
          .update(ticket)
          .set({
            user_id: response.user.id,
          })
          .where(eq(ticket.agent_id, user1.id));

        await tx
          .update(ticket_reply)
          .set({
            user_id: response.user.id,
          })
          .where(eq(ticket_reply.agent_id, user1.id));

        await tx
          .update(agentTargetTable)
          .set({
            user_id: response.user.id,
          })
          .where(eq(agentTargetTable.agent_id, user1.id));

        await tx
          .update(booking)
          .set({
            deleted_by_user: response.user.id,
          })
          .where(eq(booking.deleted_by, user1.id));

        await tx
          .update(notes)
          .set({
            user_id: response.user.id,
          })
          .where(eq(notes.agent_id, user1.id));


        await tx
          .update(todos)
          .set({
            user_id: response.user.id,
          })
          .where(eq(todos.agent_id, user1.id));

        await tx
          .update(notification)
          .set({
            user_id_v2: response.user.id,
          })
          .where(eq(notification.user_id, user1.id));

        await tx
          .update(notification_token)
          .set({
            user_id_v2: response.user.id,
          })
          .where(eq(notification_token.user_id, user1.id));
        await tx
          .update(ticket_reply)
          .set({
            user_id: response.user.id,
          })
          .where(eq(ticket_reply.agent_id, user1.id));
        await tx
          .update(chatParticipant)
          .set({
            participantId: response.user.id,
          })
          .where(eq(chatParticipant.userId, user1.id));
        await tx
          .update(chatMessage)
          .set({
            sender_id: response.user.id,
          })
          .where(eq(chatMessage.senderId, user1.id));
        await tx
          .update(chatMessageRead)
          .set({
            user_id_v2: response.user.id,
          })
          .where(eq(chatMessageRead.userId, user1.id));
      }
    });
  } catch (error) {
    console.log(error);
  }
};

migrateUser();
