import * as client from './client-schema';
import * as clientFile from './client-file-schema';
import * as user from './user-schema';
import * as transaction from './transactions-schema';
import * as cruise from './cruise-schema';
import * as flights from './flights-schema';
import * as notes from './note-schema';
import * as task from './task-schema';
import * as enquiry from './enquiry-schema';
import * as quote from './quote-schema';
import * as booking from './booking-schema'
import * as notification from "./notification-schema"
import * as agentTarget from './agent-target-schema';
import * as headlines from './headlines-schema';
import * as chat from './chat-schema';
import * as ticket from './ticket-schema';
import * as historical from './historical-schema';
import * as auth from './auth-schema';
import * as referral from './referral-schema';
import * as taskSnooze from './task-snooze-schema';
import * as ticketSnooze from './ticket-snooze-schema';
export const schema = {
  ...client,
  ...clientFile,
  ...user,
  ...transaction,
  ...cruise,
  ...flights,
  ...task,
  ...enquiry,
  ...notes,
  ...quote,
  ...booking,
  ...notification,
  ...agentTarget,
  ...headlines,
  ...chat,
  ...ticket,
  ...historical,
  ...auth,
  ...referral,
  ...taskSnooze,
  ...ticketSnooze,
};
