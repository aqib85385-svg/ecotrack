# ADR-004: Why TypeScript

## Context
Developing a complex, modular full-stack application requires robust type contracts to ensure that changes in calculations, twin forecasts, or safety filters do not result in runtime failures on data exchanges between client and server.

## Decision
We adopted TypeScript across the entire codebase (Vite + React + TS on client, Node.js + Express + TS on server) with:
- A single source of truth for schema interfaces defined in `shared/types.ts`.
- Enforced `"strict": true` type checking settings in both `server/tsconfig.json` and `tsconfig.app.json` to eliminate implicit `any` assignments, unchecked null bounds, and other unsafe expressions.

## Alternatives Considered
- **Plain JavaScript (ES6+)**: Rejected because it lack compile-time contract enforcement, increasing validation workloads and runtime bug risks.
- **Python Backend / JS Frontend**: Rejected as it prevents sharing TypeScript types and math coefficients directly between client and server, duplicating models.

## Consequences
- **Pros**: Catches type mismatches at compile time, documents request-response shapes, and increases overall code quality metrics.
- **Cons**: Minor compile-time check overhead in continuous integration workflows.
