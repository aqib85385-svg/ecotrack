# Security Architecture Manual

This manual details the security architecture, data validation guidelines, and AI safety measures implemented in EcoTrack AI.

## Layered AI Safety Gateway

To protect sensitive keys, prevent prompt injection leaks, and secure render outputs, all AI-driven recommendations and reports pass through our 6-layer Safety Gateway:

1. **Input Validation**: Custom server middleware checks limits for inputs (e.g. travel distance between 0 and 10,000 km, power usage between 0 and 100,000 kWh).
2. **Input Sanitization**: Escapes HTML tag characters (`<`, `>`, `&`, `"`, `'`, `/`) in string parameters.
3. **Prompt Risk Classification**: Checks body parameters for system prompt override phrases (`ignore instructions`, `reveal system prompt`, etc.) and rejects request on detection.
4. **Structured Prompts**: Encapsulates data in hardcoded system instructions that demand standardized JSON arrays.
5. **Output Validation**: Validates the JSON schema returned by the model.
6. **Response Sanitization**: Sanitizes returned string values to strip out unexpected HTML tags before returning them to the client.

## Core API Controls
- **Helmet Headers**: Integrated Helmet to configure strict Content Security Policies (CSP), frame guards, and XSS headers.
- **CORS limits**: Restricts origins and header methods.
- **Rate Limiting**:
  - General API: Limit of 100 requests per 15 minutes.
  - Coach/AI: Limit of 20 requests per 15 minutes to prevent billing exhaustion.
- **Secure Error Handling**: Strips stack traces in production to return uniform JSON payloads.
