# ADR-007: Multi-Layered AI Security Gateway

## Context
AI-powered coaches require dynamic user details to output relevant insights. However, this creates vectors for prompt injection (tricking the model into revealing internal prompts, API keys, or executing unsafe code) and XSS (if the model returns scripts).

## Decision
We implemented a dedicated 6-layer AI Safety Gateway model:
1. **Input Validation**: Boundaries are enforced on values.
2. **Input Sanitization**: Special characters are escaped.
3. **Prompt Risk Classification**: Inputs are regex screened for override phrases.
4. **Structured Prompts**: Instructions demand structured JSON arrays.
5. **Output Validation**: Structure is validated to prevent parsing exceptions.
6. **Response Sanitization**: Strings are cleaned from HTML tags.

## Consequences
- **Pros**: Protects keys and prompts, secures client render views, filters malicious data.
- **Cons**: Minor latency from running validation and sanitization loops on requests.
