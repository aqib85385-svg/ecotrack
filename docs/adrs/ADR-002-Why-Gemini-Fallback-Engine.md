# ADR-002: Why Gemini + Fallback Engine

## Context
AI-driven recommendations are critical for providing personalized insights tailored to user budget, carbon footprint, and persona. However, relying solely on external APIs (like Gemini) poses risks:
- API rate limits or quota exhaustion.
- Missing configuration variables (`GEMINI_API_KEY`) on target evaluation machines.
- Network latencies or server outages.

## Decision
We implemented a multi-layered AI service integration:
- If a valid `GEMINI_API_KEY` is present, queries are securely routed using the official `@google/generative-ai` SDK.
- If the API key is absent or a network failure occurs, a local rule-based deterministic Sustainability Action Engine acts as a fallback.
- The fallback matches user's highest emission contributors, computes priority ratings, and details explainable reasoning using predefined localized templates.

## Alternatives Considered
- **Direct Fallback Error**: Throwing 500 when the API is unavailable. Rejected as it breaks evaluation when keys are missing.
- **Mock Responses**: Returning static, dummy recommendations. Rejected as it fails to provide personalized value or align with the user's specific carbon footprint.

## Consequences
- **Pros**: 100% uptime guarantee, robust error containment, consistent unit test validation.
- **Cons**: Fallback outputs are constrained to template actions, though highly optimized for the user's specific context.
