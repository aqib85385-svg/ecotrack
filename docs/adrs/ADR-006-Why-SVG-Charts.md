# ADR-006: Why SVG Charts

## Context
Visual representations of emissions, trends, and Carbon Twin projections are vital. However, adding third-party charting libraries (like Chart.js or Recharts) can swell client bundle sizes, increase loading times, and introduce canvas-related accessibility barriers.

## Decision
We decided to build all charts (bar charts, line forecasts, circular progress loops) using custom-styled, inline SVG components.
- SVGs scale responsively inside Vite layouts.
- Data elements can be directly bound to semantic HTML tables, allowing screen readers to easily access the values.
- Re-renders are extremely lightweight, minimizing CPU load.

## Alternatives Considered
- **Chart.js / Recharts**: Rejected as they import heavy Canvas rendering layers that expand initial JS bundle sizes by 100KB+ and are difficult to make accessible to screen readers.

## Consequences
- **Pros**: Under 2KB bundle overhead, extremely fast load times, fully accessible for screen readers, pixel-perfect dark theme custom styling.
- **Cons**: High complexity when drawing charts (requires manual mapping of inputs to grid coordinates and generating path lines).
