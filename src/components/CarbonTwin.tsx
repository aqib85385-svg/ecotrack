import { Card } from './UI/Card.jsx';
import { api } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import type { CarbonTwinData } from '../../shared/types.js';
import { Activity, CheckCircle, ShieldAlert } from 'lucide-react';

export function CarbonTwin() {
  const { data: twin, loading, error } = useFetch<CarbonTwinData>(() => api.getTwin());

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Activity className="h-8 w-8 text-brand-emerald animate-pulse" />
        <p className="text-xs font-semibold">Generating Digital Carbon Twin model...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-brand-danger bg-red-950/20 border border-brand-danger/30 rounded-xl p-4">{error}</p>;
  }

  if (!twin || !twin.forecast || twin.forecast.length === 0) {
    return (
      <Card className="text-center py-12 text-slate-400">
        <p className="font-semibold text-sm">Twin model uninitialized.</p>
        <p className="text-xs text-slate-500 mt-1">Submit calculations to start modeling forecasts.</p>
      </Card>
    );
  }

  // Extract values to compute SVG scales
  const baselineValues = twin.forecast.map(f => f.baseline);
  const recommendedValues = twin.forecast.map(f => f.recommended);
  const optimizedValues = twin.forecast.map(f => f.optimized);
  const allValues = [twin.currentEmissions, ...baselineValues, ...recommendedValues, ...optimizedValues];
  
  const maxVal = Math.max(100, ...allValues) * 1.1; // pad top
  const minVal = 0;

  // SVG dimensions
  const width = 500;
  const height = 240;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const pointsCount = twin.forecast.length + 1; // Current + forecast points (4 points total)
  
  const getX = (index: number) => {
    return paddingLeft + (index / (pointsCount - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    const ratio = (value - minVal) / (maxVal - minVal);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  // Build coordinate arrays
  const baselinePoints = [
    { x: getX(0), y: getY(twin.currentEmissions), val: twin.currentEmissions },
    ...twin.forecast.map((f, i) => ({ x: getX(i + 1), y: getY(f.baseline), val: f.baseline }))
  ];

  const recommendedPoints = [
    { x: getX(0), y: getY(twin.currentEmissions), val: twin.currentEmissions },
    ...twin.forecast.map((f, i) => ({ x: getX(i + 1), y: getY(f.recommended), val: f.recommended }))
  ];

  const optimizedPoints = [
    { x: getX(0), y: getY(twin.currentEmissions), val: twin.currentEmissions },
    ...twin.forecast.map((f, i) => ({ x: getX(i + 1), y: getY(f.optimized), val: f.optimized }))
  ];

  // Helper to construct path string
  const getPathString = (points: { x: number; y: number }[]) => {
    return points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');
  };

  const confidenceStyles = {
    High: 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20',
    Medium: 'bg-brand-warning/10 text-brand-warning border-brand-warning/20',
    Low: 'bg-brand-danger/10 text-brand-danger border-brand-danger/20'
  };

  const confidenceIcons = {
    High: CheckCircle,
    Medium: Activity,
    Low: ShieldAlert
  };

  const ConfidenceIcon = confidenceIcons[twin.confidence];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* 1. Twin Chart Card */}
      <Card className="lg:col-span-8 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-brand-emerald rounded-full"></span>
            Predictive Emission Pathways (Carbon Twin 3.0)
          </h2>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-1 bg-brand-danger rounded-full"></span>
              <span className="text-xs text-slate-400 font-semibold">Baseline (Current Habits)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-1 bg-brand-teal rounded-full"></span>
              <span className="text-xs text-slate-400 font-semibold">Recommended Path</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-1 bg-brand-emerald rounded-full"></span>
              <span className="text-xs text-slate-400 font-semibold">Optimized Path</span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full bg-slate-950/60 border border-slate-900 rounded-2xl p-4 overflow-x-auto">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="min-w-[450px] mx-auto select-none"
              role="img"
              aria-label="Carbon Twin Forecast Chart showing baseline, recommended, and optimized emission paths over 12 months."
            >
              {/* Grid Lines */}
              <line x1={paddingLeft} y1={getY(0)} x2={width - paddingRight} y2={getY(0)} stroke="#1e293b" strokeWidth="1" />
              <line x1={paddingLeft} y1={getY(maxVal / 2)} x2={width - paddingRight} y2={getY(maxVal / 2)} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={paddingLeft} y1={getY(maxVal)} x2={width - paddingRight} y2={getY(maxVal)} stroke="#1e293b" strokeWidth="1" />

              {/* Paths */}
              <path d={getPathString(baselinePoints)} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
              <path d={getPathString(recommendedPoints)} fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />
              <path d={getPathString(optimizedPoints)} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

              {/* Scatter Dots */}
              {baselinePoints.map((p, i) => (
                <circle key={`b-${i}`} cx={p.x} cy={p.y} r="3.5" fill="#ef4444" className="cursor-pointer" />
              ))}
              {recommendedPoints.map((p, i) => (
                <circle key={`r-${i}`} cx={p.x} cy={p.y} r="3.5" fill="#14b8a6" className="cursor-pointer" />
              ))}
              {optimizedPoints.map((p, i) => (
                <circle key={`o-${i}`} cx={p.x} cy={p.y} r="3.5" fill="#10b981" className="cursor-pointer" />
              ))}

              {/* Y Axis labels */}
              <text x={paddingLeft - 10} y={getY(0) + 4} fill="#64748b" fontSize="10" textAnchor="end">0</text>
              <text x={paddingLeft - 10} y={getY(maxVal / 2) + 4} fill="#64748b" fontSize="10" textAnchor="end">
                {Math.round(maxVal / 2)}
              </text>
              <text x={paddingLeft - 10} y={getY(maxVal) + 4} fill="#64748b" fontSize="10" textAnchor="end">
                {Math.round(maxVal)}
              </text>

              {/* X Axis labels */}
              <text x={getX(0)} y={height - paddingBottom + 18} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">Current</text>
              {twin.forecast.map((f, i) => (
                <text key={i} x={getX(i + 1)} y={height - paddingBottom + 18} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {f.month.split(' ')[0]} {/* just month name */}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Accessibility Data Table */}
        <div className="mt-4">
          <span className="sr-only">Forecast pathway details table</span>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="py-2">Timeline</th>
                <th className="py-2">Baseline (kg)</th>
                <th className="py-2">Recommended (kg)</th>
                <th className="py-2">Optimized (kg)</th>
              </tr>
            </thead>
            <tbody className="text-slate-350">
              <tr className="border-b border-slate-900">
                <td className="py-2 font-bold">Current</td>
                <td className="py-2">{twin.currentEmissions}</td>
                <td className="py-2">{twin.currentEmissions}</td>
                <td className="py-2">{twin.currentEmissions}</td>
              </tr>
              {twin.forecast.map((f, i) => (
                <tr key={i} className="border-b border-slate-900">
                  <td className="py-2 font-bold">{f.month}</td>
                  <td className="py-2 text-brand-danger font-semibold">{f.baseline}</td>
                  <td className="py-2 text-brand-teal font-semibold">{f.recommended}</td>
                  <td className="py-2 text-brand-emerald font-semibold">{f.optimized}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 2. Confidence Indicator Card */}
      <Card className="lg:col-span-4 flex flex-col gap-5 justify-between">
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-brand-teal rounded-full"></span>
            Forecast Confidence
          </h2>

          <div className="flex flex-col gap-4">
            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${confidenceStyles[twin.confidence]}`}>
              <ConfidenceIcon className="h-6 w-6" />
              <div>
                <span className="text-[9px] font-bold block uppercase tracking-wider">CONFIDENCE CLASSIFICATION</span>
                <span className="text-base font-extrabold">{twin.confidence}</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-slate-300 mb-2">Confidence Explanation</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {twin.confidenceReason}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl text-[10px] text-slate-500 font-medium">
          <span className="font-bold text-slate-400 block mb-1">Modeling Parameters:</span>
          Our forecasting algorithms integrate seasonal fluctuations, baseline slopes, historical login consistency, and data variance metrics to score confidence and build pathways.
        </div>
      </Card>
    </div>
  );
}
