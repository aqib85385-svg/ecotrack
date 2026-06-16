# ADR-003: Why Carbon Twin Architecture

## Context
Standard carbon trackers only display historical carbon emissions. To drive behavioral shift, users must see the projected consequence of their current behavior vs their green target choices.

## Decision
We decided to implement a predictive "Digital Carbon Twin 3.0" forecasting model:
- Models three distinct 12-month emission pathways: Baseline, Recommended, and Optimized.
- Linear regression models the trend direction. If data volume is low, a flat baseline is mapped.
- Computes a Confidence Score (High/Medium/Low) based on logging volume, date range span, and standard deviation relative error.
- Integrated audit logs to trace Twin calculations for safety and compliance.

## Alternatives Considered
- **No Projections**: Showing only historical data. Rejected because it fails to influence long-term habit transformation.
- **Deep Learning Forecasts**: Using TensorFlow/neural networks. Rejected due to excessive CPU load on local execution, build compile complexity, and lack of portability.

## Consequences
- **Pros**: Clear predictive forecasting visualizes future carbon reduction impacts with minimal overhead.
- **Cons**: Predictions assume progressive habit improvements rather than accounting for unexpected life events.
