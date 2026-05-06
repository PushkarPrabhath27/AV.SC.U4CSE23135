# Campus Notification Platform

A robust, full-stack real-time notification system designed for university campuses to deliver critical updates regarding Placements, Events, and Results. This project demonstrates production-grade engineering practices, scalable system design, and advanced algorithmic implementations.

## 🏗️ Project Architecture

The system is built with a modular architecture to ensure scalability and maintainability:

- **Frontend (`notification_app_fe`)**: A responsive Next.js/React application providing a premium user experience with real-time updates and priority-based filtering.
- **Backend (`notification_app_be`)**: A high-performance Node.js/TypeScript service handling business logic, scoring algorithms, and data orchestration.
- **Logging Middleware (`logging_middleware`)**: A reusable, standalone package for structured telemetry and error tracking across the entire stack.
- **System Design (`notification_system_design.md`)**: Comprehensive documentation of the platform's evolution through various architectural stages.

---

## 🚀 Detailed Stage Breakdown

### Stage 1: REST API & Real-time Strategy
**The Challenge**: Designing a predictable and scalable API contract for notification delivery.
- **Approach**: Implemented a RESTful architecture for standard CRUD operations and identified **WebSockets (Socket.io)** as the optimal mechanism for real-time delivery.
- **Outcome**: Created standardized JSON schemas and header structures for fetching notifications, marking them as read, and badge counts.

### Stage 2: Data Persistence & Schema Design
**The Challenge**: Selecting a storage engine that balances relational integrity with high volume.
- **Approach**: Chose **PostgreSQL** for its ACID compliance and powerful indexing. Designed a normalized schema with a junction table (`student_notifications`) to track per-user read status efficiently.
- **Scaling Insight**: Identified that as volume reaches millions, table partitioning by `student_id` is essential for performance.

### Stage 3: Query Optimization
**The Challenge**: Resolving performance bottlenecks in unread notification fetches for 50,000+ students.
- **Approach**: Analyzed slow table scans and implemented a **Composite Index** on `(student_id, is_read, created_at)`.
- **Logic**: This avoids expensive "Full Table Scans" and allows the DB to locate, filter, and sort in a single $O(\log n)$ operation.

### Stage 4: High-Load Scaling
**The Challenge**: Protecting the primary database from being overwhelmed by concurrent page loads.
- **Approach**: Proposed a multi-layered caching strategy using **Redis** for frequent "Unread Counts" and **Read Replicas** for horizontal scaling of fetch requests.
- **Tradeoff Analysis**: Evaluated the balance between data consistency (Redis invalidation) and read performance.

### Stage 5: Reliable Distributed Notifications
**The Challenge**: Sending 50,000 simultaneous notifications reliably without blocking the main event loop.
- **Approach**: Moved from synchronous processing to an **Asynchronous Message Queue** (Producer-Consumer pattern).
- **Reliability**: Implemented chunking (1,000 IDs per batch), worker-based processing, and automatic retry logic for failed email deliveries.

### Stage 6: Priority Inbox Algorithm
**The Challenge**: Ensuring critical "Placement" notifications are never buried under "Event" updates.
- **Approach**: Developed a custom scoring algorithm: `Priority Score = (Weight * 10^12) + Timestamp_in_ms`.
- **Weights**: Placement (3) > Result (2) > Event (1).
- **Efficiency**: Utilized a **Min-Heap** data structure to maintain the Top 10 notifications in $O(\log n)$ time, ensuring the dashboard remains ultra-responsive even with rapid incoming updates.

### Stage 7: Responsive Frontend Implementation
**The Challenge**: Building a unified interface that works seamlessly on both Desktop and Mobile.
- **Approach**: Leveraged **Next.js** with **Vanilla CSS** and **Material UI** components.
- **Features**:
  - Priority vs. All view toggle.
  - Real-time status updates (New vs. Viewed).
  - Categorical filtering.
  - Dynamic badge notifications.

---

## 🛠️ Logging Middleware

The custom `logging_middleware` is a critical component for observability. It captures the entire lifecycle of events within the application:
- **Reusable Package**: Designed as a standalone module to be used by both Backend and Frontend.
- **Structured Telemetry**: Standardizes logs with `Stack`, `Level`, and `Package` identifiers.
- **Remote Sink**: Automatically transmits logs to a centralized evaluation service for real-time monitoring.

---

## 📦 How to Run

### Pre-requisites
- Node.js (v18+)
- npm / yarn

### Backend
1. Navigate to `notification_app_be`
2. `npm install`
3. `npm run dev`

### Frontend
1. Navigate to `notification_app_fe`
2. `npm install`
3. `npm run dev`

---

## ✅ Compliance & Standards
- **Anonymity**: Strictly removed all mentions of third-party organizations from project text.
- **Code Quality**: Follows production-grade naming conventions and modular design patterns.
- **Documentation**: Provided in-depth markdown explanations for every design decision made.
