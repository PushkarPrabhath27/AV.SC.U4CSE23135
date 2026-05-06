# Campus Notification Platform — System Design Document
Label: Stage 1

## Stage 1: REST API Design & Real-time Notifications

### Core Actions
1. **Fetch Notifications:** Retrieve a list of notifications for the logged-in student.
2. **Mark as Read:** Update the status of a notification to "viewed".
3. **Unread Count:** Get the total number of unread notifications for a quick badge count.
4. **Create Notification:** (Admin/Internal) Send a new notification to specific students.

### REST API Endpoints

#### 1. Fetch Notifications
- **URL:** `GET /api/notifications`
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:**
    - `page`: integer (default 1)
    - `limit`: integer (default 10)
    - `type`: string (`Event` | `Result` | `Placement`)
- **Success Response (200 OK):**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "Placement",
      "message": "Company X is hiring",
      "timestamp": "2026-05-06T12:00:00Z",
      "isRead": false
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

#### 2. Mark as Read
- **URL:** `PATCH /api/notifications/:id/read`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
```json
{
  "message": "Notification marked as read",
  "id": "uuid"
}
```

#### 3. Real-time Mechanism: WebSockets (Socket.io)
To provide real-time updates without page reloads, we will use **WebSockets**.
- **Client Side:** Connects to the server upon login and joins a room named after their unique `studentID`.
- **Server Side:** When a new notification is created, the server emits a `new_notification` event to the specific student's room.
- **Event Structure:**
```json
{
  "event": "new_notification",
  "data": {
    "id": "uuid",
    "type": "Result",
    "message": "Math results are out!"
  }
}
```

---

## Stage 2: Database Schema & Persistent Storage
Label: Stage 2

### Storage Choice: PostgreSQL
We will use **PostgreSQL** (Relational DB) for the following reasons:
- **Relational Integrity:** Students and Notifications have a clear many-to-many relationship (one notification can go to many students; one student has many notifications).
- **Complex Querying:** We need to filter by type, status, and timestamp efficiently.
- **ACID Compliance:** Ensures reliable data storage for critical updates like Results and Placements.

### Schema Design

#### 1. `students` Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | Primary Key |
| roll_no | VARCHAR | Unique, Not Null |
| email | VARCHAR | Unique, Not Null |
| name | VARCHAR | Not Null |

#### 2. `notifications` Table (Global content)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | Primary Key |
| type | ENUM | 'Event', 'Result', 'Placement' |
| message | TEXT | Not Null |
| created_at | TIMESTAMP | Default NOW() |

#### 3. `student_notifications` Table (Junction / Status)
| Column | Type | Constraints |
|--------|------|-------------|
| student_id | UUID | Foreign Key (students.id) |
| notification_id | UUID | Foreign Key (notifications.id) |
| is_read | BOOLEAN | Default FALSE |
| PRIMARY KEY | (student_id, notification_id) | |

### Scaling Concerns
As data volume increases (e.g., millions of notifications), a single table scan will slow down.
- **Solution:** Partitioning the `student_notifications` table by `student_id` or `created_at` can help manage large datasets.

### Sample Query (Fetch unread for student)
```sql
SELECT n.id, n.type, n.message, n.created_at
FROM notifications n
JOIN student_notifications sn ON n.id = sn.notification_id
WHERE sn.student_id = '1042' AND sn.is_read = FALSE
ORDER BY n.created_at DESC;
```

---

## Stage 3: Query Optimization
Label: Stage 3

### Analysis of the Slow Query
```sql
SELECT * FROM notifications 
WHERE studentID = 1042 AND isRead = false 
ORDER BY createdAt ASC;
```
**Why is it slow?**
- Without an index, the database performs a **Full Table Scan**, checking every row.
- The `ORDER BY` clause requires an extra sorting step if not indexed.

### Optimization Strategy
Adding an index on every column is **NOT** effective because:
1. **Storage Overhead:** Every index takes disk space.
2. **Write Performance:** Every `INSERT/UPDATE` becomes slower as the DB must update all indexes.
3. **Diminishing Returns:** The query optimizer only uses one or two indexes; the rest are wasted.

### Proposed Index
```sql
CREATE INDEX idx_student_notifications_unread 
ON student_notifications (student_id, is_read, created_at);
```
This is a **Composite Index**. It allows the DB to find the student, filter by read status, and sort by date in a single efficient operation.

### Placement Query (Last 7 Days)
```sql
SELECT DISTINCT s.email, s.name
FROM students s
JOIN student_notifications sn ON s.id = sn.student_id
JOIN notifications n ON sn.notification_id = n.id
WHERE n.type = 'Placement' 
  AND n.created_at >= NOW() - INTERVAL '7 days';
```

---

## Stage 4: Performance & Scaling
Label: Stage 4

### The Problem
Fetching notifications on every page load for 50,000 students creates a massive bottleneck on the primary database.

### Solutions & Tradeoffs

1. **Redis Caching**
    - **How:** Store the "Unread Count" and the "Top 10 Notifications" in Redis (In-memory).
    - **Tradeoff:** Extremely fast reads, but requires cache invalidation logic (when a user marks a notification as read, we must update Redis).

2. **HTTP Caching (ETags)**
    - **How:** Server sends an ETag header. Browser only downloads data if it has changed.
    - **Tradeoff:** Saves bandwidth, but the server still has to check the DB to generate the ETag.

3. **Read Replicas**
    - **How:** Offload `GET` requests to multiple "Read" databases, keeping the "Write" database for insertions.
    - **Tradeoff:** Eventually consistent (tiny delay in seeing a new notification), but scales horizontally.

**Recommendation:** Implement **Redis Caching** for the "Unread Count" as it's the most frequent query.

---

## Stage 5: Reliable Mass Notifications
Label: Stage 5

### Shortcomings of Current Implementation
The `notify_all` pseudocode is **Synchronous** and **Sequential**:
1. **Fragility:** If the 201st student's `send_email` fails, the entire loop stops or delays everyone else.
2. **Latency:** Sending 50,000 emails one-by-one would take hours, making the system useless for real-time updates.
3. **Database Pressure:** 50,000 simultaneous inserts in a single thread can lock the table.

### Redesign: Message Queues (Asynchronous)
We should decouple the "Notification Creation" from the "Delivery".

**New Workflow:**
1. **Producer:** Adds a single "Job" to a queue (e.g., BullMQ with Redis).
2. **Workers:** Multiple background worker processes pick up batches of IDs from the queue.
3. **Batch Inserts:** Workers use `INSERT INTO ... VALUES (), (), ...` to save to DB in chunks of 1,000.
4. **Retry Logic:** If an email fails for 200 students, the worker re-queues only those 200 IDs for a later attempt.

### Revised Pseudocode
```python
def notify_all_async(student_ids, message):
    # Step 1: Create the global notification record
    notif_id = db.save_notification(message)
    
    # Step 2: Push to Queue for background processing
    # Split into chunks to avoid memory issues
    for chunk in split_into_chunks(student_ids, 1000):
        queue.push({
            "notif_id": notif_id,
            "student_ids": chunk,
            "message": message
        })

# Background Worker Process
def process_notification_job(job):
    try:
        # Batch DB Save
        db.save_student_notifications_batch(job.student_ids, job.notif_id)
        
        # Batch Push to App (WebSockets)
        socket_io.emit_to_room(job.student_ids, "new_notif", job.message)
        
        # Email Delivery (with retry)
        for sid in job.student_ids:
            email_service.send(sid, job.message)
    except Exception:
        job.retry()
```

---

## Stage 6: Priority Inbox Implementation
Label: Stage 6

### Approach
The Priority Inbox displays the top `n` most important unread notifications. Importance is calculated using a scoring algorithm that combines:
1. **Weight:** `Placement` (3) > `Result` (2) > `Event` (1)
2. **Recency:** Newer notifications get a higher time-based score.

### Scoring Formula
`Priority Score = (Weight * 10^12) + Timestamp_in_ms`

By multiplying the weight by a very large constant ($10^{12}$), we ensure that any "Placement" notification will always outrank a "Result" notification, regardless of when they were sent. Within the same type, the timestamp ensures the newest ones appear first.

### Implementation Logic (TypeScript)
The logic resides in `notification_app_be/src/utils/priorityInbox.ts`. It fetches all notifications from the protected API and applies the sorting logic in memory to identify the top 10.

### Maintenance
To maintain the top 10 efficiently as new notifications arrive:
- We use a **Min-Heap** of size 10.
- When a new notification arrives via WebSockets, we calculate its score.
- If its score is higher than the minimum in the heap, we replace the minimum and re-heapify.
- This keeps the time complexity of updates at $O(\log n)$, which is very efficient.

