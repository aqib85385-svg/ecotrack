# ADR-007: Why Layered AI Security

## Context
AI-powered coaches require dynamic user details to output relevant insights. However, this creates vectors for prompt injection (tricking the model into revealing internal prompts, API keys, or executing unsafe code) and XSS (if the model returns scripts).

## Decision
We implemented a dedicated 6-layer AI Safety Gateway model:
1. **Input Validation**: Boundaries are enforced on values (e.g. range validation in `validator.ts`).
2. **Input Sanitization**: Special characters are escaped (HTML character replacements in `securityFilter.ts`).
3. **Prompt Risk Classification**: Inputs are screened for prompt injection override phrases before reaching the AI model (`safetyGateway.ts`).
4. **Structured Prompts**: Instructions demand structured JSON arrays.
5. **Output Validation**: Structure is validated to prevent parsing exceptions.
6. **Response Sanitization**: Strings are cleaned from HTML tags.

## Alternatives Considered
- **No Safety Gateway**: Relying strictly on client-side protection. Rejected due to vulnerability to API bypasses.
- **Client-Side Escape Only**: Rejected as it fails to defend against API key extraction or prompt leaks.

## Consequences
- **Pros**: Protects keys and prompts, secures client render views, filters malicious data.
- **Cons**: Minor latency from running validation and sanitization loops on requests.
