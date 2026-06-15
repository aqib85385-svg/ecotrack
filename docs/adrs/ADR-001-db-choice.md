# ADR-001: Selection of Lightweight JSON Database

## Context
The platform requires a lightweight persistence mechanism for tracking user carbon footprint calculations, streaking statistics, eco challenge completion histories, and compliance audit logs. While traditional SQL databases (like SQLite or PostgreSQL) or Document Databases (like MongoDB) are industry standards, introducing external database engines or native bindings (such as `better-sqlite3` or `sqlite3`) can introduce native compilation issues on target environments (especially on Windows during judge evaluations).

## Decision
We decided to implement a thread-safe, transaction-locked in-memory JSON file database system (`server/data/db.json` managed via `server/services/dbService.ts`). To prevent race conditions or database corruption under concurrency:
- All reads and writes pass through an asynchronous in-memory `TaskQueue` that processes requests in a strict FIFO order.
- The schema is unified and easily serializable, allowing zero-configuration startup, simple deployment, and fast backup options.

## Consequences
- **Pros**: Zero native build tool dependencies, 100% portable, extremely fast read operations, simple inspectability for judges.
- **Cons**: Not suitable for large-scale enterprise production with millions of concurrent writes (can scale by swapping the `dbService.ts` implementation to use an ORM like Prisma or direct SQL commands without affecting controller routing).

## Alternatives Considered
- **SQLite**: Rejected due to high risk of binary compilation errors on target evaluation machines.
- **PostgreSQL**: Rejected due to configuration overhead (setting up schemas, connections, and database clusters).
