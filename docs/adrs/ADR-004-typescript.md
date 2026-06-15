# ADR-004: Full-Stack TypeScript Architecture

## Context
Developing a complex, modular full-stack application requires robust interfaces to ensure that changes in calculations, twin forecasts, or safety filters don't result in runtime failures on data exchanges.

## Decision
We adopted TypeScript for both frontend (Vite + React + TS) and backend (Node.js + Express + TS compiled/run via `tsx`). 
- Shared schemas are maintained inside `shared/types.ts`.
- Strict mode compiler flags are enabled, enforcing type validation across boundaries.

## Consequences
- **Pros**: Catches compiler-time mismatches, ensures predictable APIs, self-documents request-response shapes.
- **Cons**: Minor overhead compiling server files during CI checks.
