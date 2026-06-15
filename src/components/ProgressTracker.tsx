import { Card } from './UI/Card.jsx';
import { api } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import type { CalculationResult, UserStats } from '../../shared/types.js';
import { History, Flame, Award, ShieldAlert, Sparkles, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface HistoryResponse {
  history: CalculationResult[];
  stats: UserStats;
  risk: {
    level: 'Low' | 'Medium' | 'High';
    reason: string;
    metrics: {
      trendSlope: number;
      adoptionRate: number;
      challengeRate: number;
    };
  };
}

export function ProgressTracker() {
  const { data, loading, error } = useFetch<HistoryResponse>(() => api.getHistory());

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Flame className="h-8 w-8 text-brand-emerald animate-pulse" />
        <p className="text-xs font-semibold">Retrieving history data...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-brand-danger bg-red-950/20 border border-brand-danger/30 rounded-xl p-4">{error}</p>;
  }

  if (!data || !data.history || data.history.length === 0) {
    return (
      <Card className="text-center py-12 text-slate-400 animate-fade-in">
        <History className="h-10 w-10 mx-auto mb-2 text-slate-605" />
        <p className="font-semibold text-sm">No calculations recorded.</p>
        <p className="text-xs text-slate-500 mt-1">Submit your carbon calculations to build your history profile.</p>
      </Card>
    );
  }

  const { history, stats, risk } = data;

  // Sort calculations chronologically for rendering
  const chronHistory = history
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Determine recent change
  let changePct = 0;
  let isDown = true;
  if (chronHistory.length >= 2) {
    const prev = chronHistory[chronHistory.length - 2].totalEmissions;
    const curr = chronHistory[chronHistory.length - 1].totalEmissions;
    if (prev > 0) {
      changePct = Number((((curr - prev) / prev) * 100).toFixed(1));
    }
    isDown = curr <= prev;
  }

  // Calculate coordinates for SVG trend
  const svgWidth = 400;
  const svgHeight = 150;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;
  const maxE = Math.max(100, ...chronHistory.map(h => h.totalEmissions)) * 1.1;

  const points = chronHistory.map((h, i) => {
    const x = paddingX + (i / Math.max(1, chronHistory.length - 1)) * chartW;
    const y = paddingY + chartH - (h.totalEmissions / maxE) * chartH;
    return { x, y, val: h.totalEmissions, date: new Date(h.timestamp) };
  });

  const pathStr = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Badges lists
  const allBadges = [
    { id: 'Green Starter', label: 'Green Starter', desc: 'Completed your first carbon footprint log', color: 'bg-brand-teal text-slate-950 border-brand-teal/20' },
    { id: 'Climate Champion', label: 'Climate Champion', desc: 'Completed 3 sustainability challenges', color: 'bg-brand-cyan text-slate-950 border-brand-cyan/20' },
    { id: 'Eco Hero', label: 'Eco Hero', desc: 'Completed 5 sustainability challenges or streak over 3w', color: 'bg-brand-emerald text-slate-950 border-brand-emerald/20' },
    { id: 'Sustainability Expert', label: 'Eco Expert', desc: 'Completed all platform challenges', color: 'bg-brand-warning text-slate-950 border-brand-warning/20' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
      {/* 1. Timeline & SVG Trend line */}
      <Card className="md:col-span-8 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-brand-emerald" />
              Calculation History Trends
            </h2>
            {chronHistory.length >= 2 && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isDown ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-brand-danger/10 text-brand-danger'
              }`}>
                {isDown ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                <span>{Math.abs(changePct)}% {isDown ? 'Reduction' : 'Increase'}</span>
              </div>
            )}
          </div>

          {/* SVG Trend Graph */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 overflow-x-auto">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="min-w-[320px] mx-auto select-none"
              role="img"
              aria-label="Monthly carbon emission trends over time."
            >
              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#1e293b" strokeWidth="0.5" />
              <line x1={paddingX} y1={paddingY + chartH / 2} x2={svgWidth - paddingX} y2={paddingY + chartH / 2} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1={paddingX} y1={paddingY + chartH} x2={svgWidth - paddingX} y2={paddingY + chartH} stroke="#1e293b" strokeWidth="0.5" />

              {/* Trend path line */}
              {points.length >= 2 && (
                <path d={pathStr} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              )}

              {/* Data points */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="3.5" fill="#10b981" />
                  <text x={p.x} y={p.y - 8} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
                    {Math.round(p.val)}
                  </text>
                </g>
              ))}

              {/* Dates labels */}
              {points.map((p, i) => (
                <text key={`d-${i}`} x={p.x} y={svgHeight - paddingY + 15} fill="#64748b" fontSize="8" textAnchor="middle">
                  {p.date.toLocaleDateString('en-US', { month: 'short' })}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Chronological calculation cards list */}
        <div className="mt-6 space-y-3 max-h-[180px] overflow-y-auto pr-1">
          {chronHistory.slice().reverse().map((calc) => (
            <div key={calc.id} className="bg-slate-900/40 border border-slate-850 rounded-xl p-3.5 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">
                  {new Date(calc.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="font-semibold text-slate-300">
                  Persona: {calc.persona} | Diet: {calc.inputs.dietType}
                </span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-slate-200 block">{calc.totalEmissions} kg CO₂</span>
                <span className="text-[10px] text-brand-emerald font-bold">Score: {calc.carbonScore}/100</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Streak / Risk Analysis Card */}
      <Card className="md:col-span-4 flex flex-col justify-between gap-6">
        {/* Risk Assessment */}
        <div>
          <h2 className="text-sm uppercase text-slate-400 tracking-wider font-bold mb-3 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-brand-danger" />
            Behavioral Risk
          </h2>
          
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`h-2.5 w-2.5 rounded-full ${
                risk.level === 'High' ? 'bg-brand-danger' : risk.level === 'Low' ? 'bg-brand-emerald' : 'bg-brand-warning'
              }`}></span>
              <span className={`text-sm font-extrabold ${
                risk.level === 'High' ? 'text-brand-danger' : risk.level === 'Low' ? 'text-brand-emerald' : 'text-brand-warning'
              }`}>
                {risk.level} Risk Profile
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {risk.reason}
            </p>
          </div>
        </div>

        {/* Streaks and points */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-2xl text-center">
            <Flame className="h-5 w-5 text-brand-warning fill-brand-warning/15 mx-auto mb-1" />
            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">TRACKING STREAK</span>
            <span className="text-xl font-extrabold text-slate-200">{stats.streak || 0} Weeks</span>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-2xl text-center">
            <Award className="h-5 w-5 text-brand-emerald fill-brand-emerald/15 mx-auto mb-1" />
            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">ECO POINTS</span>
            <span className="text-xl font-extrabold text-slate-200">{stats.points || 0} pts</span>
          </div>
        </div>

        {/* Milestones / Badges */}
        <div>
          <h2 className="text-xs uppercase text-slate-400 tracking-wider font-bold mb-3">Unlocked Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {allBadges.map((badge) => {
              const unlocked = stats.unlockedAchievements?.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  title={badge.desc}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-all select-none ${
                    unlocked 
                      ? `${badge.color} opacity-100 scale-100 shadow-sm`
                      : 'bg-slate-950/20 text-slate-600 border-slate-900/60 opacity-40'
                  }`}
                >
                  <Sparkles className={`h-3 w-3 ${unlocked ? 'text-current' : 'text-slate-700'}`} />
                  {badge.label}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
