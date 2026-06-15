# ADR-005: Accessibility-First Design (WCAG 2.1 AA Compliance)

## Context
Full-stack web applications must be usable by all individuals, including those navigating via screen readers or keyboards. Achieving this requires semantic markup structure, color contrast ratios, and keyboard focus controls.

## Decision
We implemented accessibility design as a core architectural constraint:
- Strict HTML5 semantic elements (`<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`).
- Custom color tokens with contrast ratios $> 4.5:1$ for body and $> 3:1$ for headers.
- Media queries respecting `prefers-reduced-motion` settings.
- Accessibility tests using headless checkers are included in the CI test pipeline to block regressions.

## Consequences
- **Pros**: Wide reach, fully keyboard-controllable (no mouse needed), robust usability standards.
- **Cons**: Takes more time to design components, requiring aria attributes and custom focus indicators.
