# ADR-005: Why Accessibility-First Design

## Context
Full-stack web applications must be usable by all individuals, including those navigating via screen readers or keyboards. Achieving this requires semantic markup structure, custom focus outline overrides, and responsive styling.

## Decision
We implemented accessibility design as a core architectural constraint:
- Enforcing semantic HTML5 landmark tags (`<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`).
- Custom color tokens with contrast ratios exceeding $4.5:1$ for body and $> 3:1$ for headers.
- Semantic hidden tables (`.sr-only`) mapping raw chart coordinates to allow assistive technologies to read graphic datasets.
- Media queries respecting `prefers-reduced-motion` settings.
- Headless accessibility checks in our integration test suite.

## Alternatives Considered
- **Standard UI Library Defaults**: Rejected because default configurations of standard UI packages often lack appropriate ARIA mappings or fail color-contrast rules, requiring massive refactoring later.

## Consequences
- **Pros**: Complete WCAG 2.1 AA compliance, fully keyboard-navigable interface, robust screen reader accessibility.
- **Cons**: Development overhead from coding custom focus indicators, tab-indexes, and ARIA attributes manually.
