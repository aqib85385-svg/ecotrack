import React from 'react';
import { Card } from './UI/Card.jsx';
import { api } from '../services/api.js';
import { Sliders, Leaf } from 'lucide-react';

interface SimulationResult {
  baseline: {
    transport: number;
    food: number;
    energy: number;
    lifestyle: number;
    total: number;
    score: number;
  };
  projected: {
    transport: number;
    food: number;
    energy: number;
    lifestyle: number;
    total: number;
    score: number;
  };
  monthlyReduction: number;
  annualReduction: number;
}

export function ImpactSimulator() {
  const [switchTransit, setSwitchTransit] = React.useState(false);
  const [reduceElectricity, setReduceElectricity] = React.useState(0);
  const [dietType, setDietType] = React.useState('');
  const [shoppingHabits, setShoppingHabits] = React.useState('');

  const [result, setResult] = React.useState<SimulationResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Trigger simulation whenever parameters change
  const triggerSimulation = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.simulate({
        switchTransit,
        reduceElectricityPct: reduceElectricity,
        newDietType: dietType,
        newShoppingHabits: shoppingHabits
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Simulation failed.');
    } finally {
      setLoading(false);
    }
  }, [switchTransit, reduceElectricity, dietType, shoppingHabits]);

  React.useEffect(() => {
    // Debounce the call to avoid excessive queries during slider dragging
    const delayDebounce = setTimeout(() => {
      triggerSimulation();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [switchTransit, reduceElectricity, dietType, shoppingHabits, triggerSimulation]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
      {/* 1. Simulation controls */}
      <Card className="md:col-span-6 flex flex-col gap-5">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sliders className="h-5 w-5 text-brand-emerald" />
          Impact Simulation Controls
        </h2>

        <div className="flex flex-col gap-4">
          {/* Transit Toggle */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-200 block">Switch to Public Transit</span>
              <span className="text-[10px] text-slate-500 font-medium">Replaces car travel with bus/train emissions</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={switchTransit} 
                onChange={(e) => setSwitchTransit(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-emerald peer-checked:after:bg-slate-950"></div>
            </label>
          </div>

          {/* Electricity slider */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold text-slate-200 block">Reduce Electricity usage</span>
                <span className="text-[10px] text-slate-500 font-medium">Reduce HVAC/heating load</span>
              </div>
              <span className="text-xs font-bold text-brand-emerald">{reduceElectricity}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={reduceElectricity} 
              onChange={(e) => setReduceElectricity(Number(e.target.value))}
              className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-emerald" 
            />
          </div>

          {/* Diet dropdown */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
            <label htmlFor="sim-diet" className="text-sm font-semibold text-slate-200 block">
              Transition Diet
            </label>
            <select
              id="sim-diet"
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl focus:border-brand-emerald focus:outline-none text-xs text-slate-350 cursor-pointer"
            >
              <option value="">Keep current baseline diet</option>
              <option value="omnivore">Omnivore (Heavy Meat)</option>
              <option value="average_meat">Average Meat Eating</option>
              <option value="pescatarian">Pescatarian (Fish & Veg)</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan (100% Plant-Based)</option>
            </select>
          </div>

          {/* Shopping habits dropdown */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
            <label htmlFor="sim-shopping" className="text-sm font-semibold text-slate-200 block">
              Shopping Habits
            </label>
            <select
              id="sim-shopping"
              value={shoppingHabits}
              onChange={(e) => setShoppingHabits(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl focus:border-brand-emerald focus:outline-none text-xs text-slate-350 cursor-pointer"
            >
              <option value="">Keep current shopping baseline</option>
              <option value="high">High Consumer (Frequent Purchases)</option>
              <option value="moderate">Moderate Consumer</option>
              <option value="low">Minimalist (Buy Second-Hand)</option>
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-brand-danger font-medium">{error}</p>}
      </Card>

      {/* 2. Simulation projections */}
      <Card className="md:col-span-6 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-brand-teal" />
            Projected Emission Savings
          </h2>

          {!result ? (
            <div className="py-20 flex justify-center text-slate-500 text-xs">
              Calculating simulation parameters...
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-emerald/10 border border-brand-emerald/20 p-4 rounded-2xl text-center">
                  <span className="text-[10px] text-brand-emerald font-bold block uppercase tracking-wider">MONTHLY SAVINGS</span>
                  <span className="text-2xl font-black text-brand-emerald mt-1.5 block">
                    {result.monthlyReduction} kg
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">CO₂ emissions cut</span>
                </div>

                <div className="bg-brand-teal/10 border border-brand-teal/20 p-4 rounded-2xl text-center">
                  <span className="text-[10px] text-brand-teal font-bold block uppercase tracking-wider">ANNUAL SAVINGS</span>
                  <span className="text-2xl font-black text-brand-teal mt-1.5 block">
                    {result.annualReduction} kg
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Equivalent to 45 trees planted</span>
                </div>
              </div>

              {/* Graphical Comparsion bars */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comparison Breakdown</h3>

                {/* Total Comparison */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Total Monthly Footprint</span>
                    <span className="text-slate-400">
                      {result.baseline.total} kg → <span className="text-brand-emerald font-bold">{result.projected.total} kg</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-900/60 rounded-full h-3 border border-slate-800/80 flex overflow-hidden">
                    <div 
                      className="bg-brand-danger h-full transition-all duration-300" 
                      style={{ width: `${(result.projected.total / result.baseline.total) * 100}%` }}
                    ></div>
                    <div className="bg-brand-emerald/20 h-full flex-1"></div>
                  </div>
                </div>

                {/* Score change */}
                <div className="flex justify-between items-center bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 text-xs">
                  <span className="text-slate-350 font-semibold">Projected Carbon Score improvement:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold">{result.baseline.score}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-brand-emerald font-extrabold text-sm">{result.projected.score}/100</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-4 text-[10px] text-slate-500 font-bold flex items-center gap-1.5 animate-pulse">
            <Sliders className="h-3.5 w-3.5 text-brand-emerald" />
            <span>Calculating projected variables...</span>
          </div>
        )}
      </Card>
    </div>
  );
}
