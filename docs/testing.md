# Testing Strategy Manual

This manual details the test coverage, automation checks, and quality assurance strategy implemented in the platform.

## Test Suite Categories

The project uses **Vitest** for running test suites. The goal is to achieve $90\%+$ test coverage:

1. **Unit Tests (`tests/`)**:
   - `calculator.test.ts`: Verifies distance boundaries and inputs validation.
   - `formulas.test.ts`: Validates transport, diet, and electricity formulas.
   - `carbonTwin.test.ts`: Validates linear forecasting projections and confidence scoring logic.
   - `riskEngine.test.ts`: Asserts Behavioral Risk classification (Low, Medium, High) outputs.
2. **Integration Tests (`tests/`)**:
   - `api.test.ts`: Uses `supertest` to fetch from express routes, verifying responses and status codes.
   - `scenario.test.ts`: Verifies month-by-month roadmap generation.
   - `audit.test.ts`: Verifies database audit logging insertion.
3. **Security Validation**:
   - `security.test.ts`: Tests prompt injection rejections, HTML XSS escaping, and out-of-bounds inputs.
4. **Accessibility Checks**:
   - `accessibility.test.ts`: Uses `axe-core` to check focus targets and structural semantics.

## Automated Verification Commands
```bash
# Run all tests
npm run test

# Run tests with coverage statistics
npm run test:coverage
```
