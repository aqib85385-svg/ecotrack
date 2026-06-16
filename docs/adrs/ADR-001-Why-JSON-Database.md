# ADR-001: Why JSON Database

## Context
The platform requires a lightweight persistence mechanism for tracking user carbon footprint calculations, streaking statistics, eco challenge completion histories, and compliance audit logs. While traditional SQL databases (like SQLite or PostgreSQL) or Document Databases (like MongoDB) are industry standards, introducing external database engines or native bindings (such as `better-sqlite3` or `sqlite3`) can introduce native compilation issues on target environments (especially on Windows during judge evaluations).

## Decision
We decided to implement a thread-safe, transaction-locked JSON file database system (`server/data/db.json` managed via `server/services/dbService.ts`) with the following optimizations:
- An in-memory cache layer that resolves read queries directly from memory to avoid disk I/O bottlenecks.
- Sequential asynchronous TaskQueue FIFO scheduling to prevent concurrent file locking or collision hazards.
- Clean database state serialization to allow zero-configuration startup, simple deployment, and fast backup options.

## Alternatives Considered
- **SQLite**: Rejected due to high risk of binary compilation errors on target evaluation machines during package installation.
- **PostgreSQL / MongoDB**: Rejected due to database connection string requirements, schema migration complexities, and setup overhead for local judge environments.

## Consequences
- **Pros**: Zero native build tool dependencies, 100% portable, extremely fast read operations due to cached reads, simple inspectability for judges.
- **Cons**: Not suitable for large-scale enterprise production with millions of concurrent writes (can scale by swapping the `dbService.ts` implementation to use an ORM like Prisma or direct SQL commands without affecting controller routing).
