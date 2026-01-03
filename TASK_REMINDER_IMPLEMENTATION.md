# Task Reminder Cron Job Implementation

## Overview
This implementation adds a cron job that automatically sends Socket.IO notifications to users when their tasks are due in 5 minutes.

## Components

### 1. Task Reminder Cron Job (`src/lib/task-reminder-cron.ts`)
- **Schedule**: Runs every minute (`* * * * *`)
- **Functionality**: 
  - Queries the database for tasks due between 5-6 minutes from now
  - Excludes completed and cancelled tasks
  - Sends socket notifications to assigned users
  - Includes task details (title, priority, due date, client info, etc.)

### 2. Repository Updates (`src/repository/task.repo.ts`)
Added new method:
- `fetchTasksDueInTimeframe(startTime: Date, endTime: Date)`: Fetches tasks within a specific time range

### 3. Socket Handler Integration (`src/lib/socket-handler.ts`)
- Initializes the cron job when the socket server starts
- Added event handler: `request_task_reminder_check` for manual testing
- Uses existing `emitToUser()` function to send targeted notifications

## Socket Events

### Client-Side Events

#### 1. `task_reminder` (Received by client)
Sent automatically when a task is due in 5 minutes.

**Payload:**
```typescript
{
  taskId: string;
  title: string;
  task: string;
  dueDate: string; // ISO string
  priority: string;
  status: string;
  transactionId: string | null;
  clientName: string | null;
  assignedBy: string | null;
  message: string; // "Task 'XYZ' is due in 5 minutes!"
}
```

**Client Example:**
```typescript
socket.on('task_reminder', (data) => {
  console.log('Task reminder:', data);
  // Show notification to user
  showNotification({
    title: data.title,
    message: data.message,
    priority: data.priority,
    dueDate: data.dueDate
  });
});
```

#### 2. `request_task_reminder_check` (Sent by client)
Manually trigger a check for tasks due in 5 minutes (useful for testing).

**Usage:**
```typescript
socket.emit('request_task_reminder_check');
```

**Response Event:** `task_reminder_check_result`
```typescript
socket.on('task_reminder_check_result', (data) => {
  console.log(`Found ${data.count} tasks due in 5 minutes`);
  console.log(data.tasks);
});
```

## How It Works

1. **Cron Job Execution** (Every minute)
   - Calculates time window: 5-6 minutes from current time
   - Queries database for matching tasks
   - Filters out completed/cancelled tasks

2. **Notification Delivery**
   - Identifies the assigned user (via `user_id` or `agent_id`)
   - Prepares notification data with task details
   - Emits `task_reminder` event to the user's personal room (`user:{userId}`)

3. **User Reception**
   - Client must be authenticated and connected to Socket.IO
   - Automatically joined to personal room during authentication
   - Receives real-time notifications when tasks are due

## Installation

The following packages were installed:
```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

## Database Schema

Uses existing `task_table` schema:
- `id`: Task identifier
- `due_date`: Timestamp for task deadline
- `status`: Task status (filters out 'completed', 'cancelled')
- `user_id` / `agent_id`: Assigned user
- `title`, `task`, `priority`: Task details
- Relations: `user`, `client`, `assigned_by_user`, `transaction`

## Testing

### Manual Testing
1. Connect to socket server and authenticate
2. Emit `request_task_reminder_check` event
3. Check console logs for found tasks
4. Listen for `task_reminder_check_result` event

### Create Test Task
Create a task with `due_date` set to 5 minutes from now:
```sql
INSERT INTO task_table (
  user_id, 
  title, 
  task, 
  due_date, 
  status, 
  priority
) VALUES (
  'your-user-id',
  'Test Task',
  'This is a test task',
  NOW() + INTERVAL '5 minutes',
  'pending',
  'high'
);
```

### Verify Logs
Check backend console for:
- `✓ Task reminder cron job initialized - running every minute`
- `Running task reminder check...`
- `Found X task(s) due in 5 minutes`
- `Sent task reminder for task {id} to user {userId}`

## Architecture Benefits

1. **Scalable**: Cron job runs independently of user connections
2. **Targeted**: Notifications sent only to assigned users
3. **Efficient**: Queries only tasks within specific time window
4. **Real-time**: Uses existing Socket.IO infrastructure
5. **Testable**: Manual trigger available for development/testing

## Error Handling

- Database query failures are caught and logged
- Missing user assignments are handled gracefully
- Cron job continues running even if individual notifications fail
- Socket errors don't crash the cron job

## Future Enhancements

Possible improvements:
- Configurable reminder intervals (10 min, 30 min, 1 hour before)
- Email fallback for offline users
- Snooze functionality
- Task reminder preferences per user
- Batch notifications for multiple tasks
- Mark reminders as acknowledged
