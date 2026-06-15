# Accessibility Compliance Manual (WCAG 2.1 AA)

This manual details the accessibility features, focus indicators, and screen reader configurations implemented to satisfy the WCAG 2.1 AA compliance benchmarks.

## Compliance Checklist

- **Semantic HTML**: Standardized HTML5 structures are used (`<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`).
- **Focus Management**: Custom focus indicators are added with a $> 3:1$ contrast boundary. Tab order is mapped linearly.
- **Screen Reader Support**: ARIA landmarks (`role="img"`, `aria-label`, `aria-describedby`) are attached to SVG charts.
- **Data Tables**: Screen readers have access to semantic hidden tables underneath charts mapping values directly.
- **Contrast Ratios**: Custom theme brand colors enforce a $> 4.5:1$ contrast ratio for body copy and $> 3:1$ for large text blocks.
- **Reduced Motion**: Styles check for `prefers-reduced-motion` media preferences to disable transitions and animation delays.

## Keyboard Map
- `Tab` / `Shift+Tab`: Cycles through interactive form fields, dropdown selections, tabs, and buttons.
- `Enter` / `Space`: Triggers button clicks, dropdown options, and navigation tabs.
