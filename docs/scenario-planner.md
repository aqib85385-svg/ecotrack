# Sustainability Scenario Planner Manual

This manual details the scenario planning algorithms and target goal calculations.

## Goal Specifications & Targets

Users can set specific targets:
- **10% / 25% Reduction**: Calculates monthly carbon cut goals relative to user's latest footprint baseline, mapping cost savings proportionally.
- **₹10,000 Savings**: Sets savings targets of ₹833 / month, calculating proportional carbon savings.
- **Top 20% Rank**: Sets target emissions threshold of 200 kg CO₂ / month, planning steps to reach it.

## Roadmap Milestone Synthesis

The roadmap spans 3 months, offering step-by-step habit transitions:
- **Month 1**: Focuses on simple adjustments (switching short trips to walking, setting thermostat temperature offsets).
- **Month 2**: Implements mid-level adjustments (LED bulbs, taking transit).
- **Month 3**: Integrates high-impact modifications (diet transition, solar contracts).

## Goal Completion Probability Model

Goal completion probabilities are adjusted based on user tracking risk:
- **High Risk**: Penalty of $-25\%$ to probability (due to low challenge completions or rising emissions).
- **Low Risk**: Bonus of $+10\%$ to probability (due to high challenge completions and downward trend).
- **Large Goals (> 300 kg/month reduction)**: Penalty of $-15\%$ (due to task difficulty).
