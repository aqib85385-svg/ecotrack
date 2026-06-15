# ADR-003: Carbon Twin Architecture and Confidence Scoring

## Context
Standard carbon trackers only display historical carbon emissions. To drive behavioral shift, users must see the projected consequence of their current behavior vs their green target choices.

## Decision
We implemented a predictive "Digital Carbon Twin 3.0" forecasting model:
- Models three distinct 12-month emission pathways: Baseline, Recommended, and Optimized.
- Linear regression models the trend direction. If data volume is low, a flat baseline is mapped.
- Computes a Confidence Score (High/Medium/Low) based on logging volume, date range span, and standard deviation relative error.

## Consequences
- **Pros**: Clear predictive forecasting visualizes future carbon reduction impacts.
- **Cons**: Predictions assume progressive habit improvements rather than accounting for unexpected life events.
