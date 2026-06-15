import React from 'react';
import { Card } from './UI/Card.jsx';
import { Button } from './UI/Button.jsx';
import { api } from '../services/api.js';
import type { ScenarioPlan } from '../../shared/types.js';
import { Calendar, Target, AlertCircle } from 'lucide-react';

export function ScenarioPlanner() {
  const [goalType, setGoalType] = React.useState('reduction_10');
  const [plan, setPlan] = React.useState<ScenarioPlan | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.generatePlan(goalType);
      setPlan(data);
    } catch (err: any) {
      setError(err.message || 'Failed to construct scenario roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const goalLabels = {
    reduction_10: 'Reduce emissions by 10% (Target easy reductions)',
    reduction_25: 'Reduce emissions by 25% (Target aggressive reductions)',
    money_10000: 'Save ₹10,000 annually (Target monetary ROI savings)',
    top_20: 'Reach Top 20% ranking (Reduce footprint below 200kg)'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Target Selector */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-brand-emerald" />
          Sustainability Target
        </h2>

        <Card className="flex flex-col gap-5">
          <p className="text-xs text-slate-400">
            Set your target sustainability goal. The Scenario Planner will synthesize a customized month-by-month roadmap mapping habits changes matching your profile.
          </p>

          <div className="flex flex-col gap-4">
            {Object.entries(goalLabels).map(([key, label]) => (
              <label 
                key={key} 
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-colors ${
                  goalType === key 
                    ? 'bg-brand-emerald/10 border-brand-emerald/25 text-slate-100' 
                    : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800'
                }`}
              >
                <input 
                  type="radio" 
                  name="goalType" 
                  value={key} 
                  checked={goalType === key} 
                  onChange={() => setGoalType(key)} 
                  className="mt-0.5 accent-brand-emerald"
                />
                <span className="text-xs font-semibold">{label}</span>
              </label>
            ))}
          </div>

          {error && <p className="text-xs text-brand-danger font-semibold">{error}</p>}

          <Button onClick={handleGeneratePlan} loading={loading} className="w-full">
            Generate Action Roadmap
          </Button>
        </Card>
      </div>

      {/* Plan Output */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-teal" />
          Roadmap Plan
        </h2>

        {!plan ? (
          <Card className="flex flex-col items-center justify-center py-24 text-center text-slate-500">
            <Target className="h-12 w-12 mb-3 text-slate-650 animate-pulse" />
            <p className="text-xs font-semibold">No active roadmap generated.</p>
            <p className="text-[10px] text-slate-600 mt-1 max-w-xs">
              Select a goal and click the button to build your progressive carbon reduction schedule.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* Top metrics summary */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-2xl">
                <span className="text-[9px] text-slate-500 font-bold block uppercase">CO₂ CUTS</span>
                <span className="text-sm font-extrabold text-brand-emerald mt-1 block">{plan.totalCo2Reduction} kg/yr</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-2xl">
                <span className="text-[9px] text-slate-500 font-bold block uppercase">SAVINGS</span>
                <span className="text-sm font-extrabold text-brand-teal mt-1 block">₹{plan.totalSavings.toLocaleString('en-IN')}/yr</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-2xl">
                <span className="text-[9px] text-slate-500 font-bold block uppercase">PROBABILITY</span>
                <span className={`text-sm font-extrabold mt-1 block ${
                  plan.probability >= 75 ? 'text-brand-emerald' : plan.probability >= 50 ? 'text-brand-warning' : 'text-brand-danger'
                }`}>
                  {plan.probability}%
                </span>
              </div>
            </div>

            {/* Monthly roadmap milestones */}
            <div className="flex flex-col gap-4">
              {plan.roadmap.map((milestone) => (
                <Card key={milestone.month} className="relative overflow-hidden bg-slate-900/40 border-l-4 border-l-brand-teal">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-brand-teal uppercase tracking-wider">
                      Month {milestone.month} Milestone
                    </span>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold">
                      <span>-{milestone.monthlyCo2Reduction} kg CO₂</span>
                      <span>₹{milestone.monthlySavings} saved</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5">
                    {milestone.actions.map((action, idx) => (
                      <li key={idx} className="text-xs text-slate-350 flex items-start gap-2 font-medium">
                        <AlertCircle className="h-4 w-4 text-brand-teal shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            <div className="bg-slate-950/60 border border-slate-900 p-3 rounded-xl text-[10px] text-slate-500 leading-relaxed font-semibold">
              <span className="font-bold text-slate-400 block mb-1">Time Horizon:</span>
              This program is scheduled over {plan.timeRequired} to end in {plan.targetDate}. Progress tracking updates these projections weekly.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
