import React from 'react';
import { Card } from './UI/Card.jsx';
import { Button } from './UI/Button.jsx';
import { Input } from './UI/Input.jsx';
import { api } from '../services/api.js';
import type { CalculationInput, CalculationResult } from '../../shared/types.js';
import { Calculator } from 'lucide-react';

interface CarbonCalculatorProps {
  onCalculationCompleted: (result: CalculationResult) => void;
  initialPersona: string | null;
}

export function CarbonCalculator({ onCalculationCompleted, initialPersona }: CarbonCalculatorProps) {
  const [formData, setFormData] = React.useState<CalculationInput>({
    persona: (initialPersona as any) || 'Student',
    transportMethod: 'public_transit',
    dailyDistance: 10,
    dietType: 'vegetarian',
    electricityUsage: 150,
    electricityType: 'grid',
    shoppingHabits: 'moderate'
  });

  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<CalculationResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialPersona) {
      setFormData(prev => ({ ...prev, persona: initialPersona as any }));
    }
  }, [initialPersona]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'dailyDistance' || name === 'electricityUsage' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const calcResult = await api.calculate(formData);
      setResult(calcResult);
      onCalculationCompleted(calcResult);
    } catch (err: any) {
      setError(err.message || 'Calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Safe Math helper
  const getPct = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
      {/* Inputs Card */}
      <Card className="md:col-span-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-brand-emerald rounded-full"></span>
          Input Footprint Parameters
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="persona" className="text-sm font-semibold text-slate-300">
              User Persona
            </label>
            <select
              id="persona"
              name="persona"
              value={formData.persona}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald focus:outline-none transition-colors text-slate-100 cursor-pointer"
            >
              <option value="Student">Student (Frugal/Public Transit)</option>
              <option value="Professional">Professional (Active Driving/Busy)</option>
              <option value="Family Household">Family Household (HVAC/Multi-user)</option>
              <option value="Remote Worker">Remote Worker (Home Office/Low Commute)</option>
              <option value="Eco-Conscious User">Eco-Conscious User (Active Green Choice)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="transportMethod" className="text-sm font-semibold text-slate-300">
                Commute Method
              </label>
              <select
                id="transportMethod"
                name="transportMethod"
                value={formData.transportMethod}
                onChange={handleChange}
                className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald focus:outline-none text-slate-100 cursor-pointer"
              >
                <option value="petrol_car">Petrol Car</option>
                <option value="diesel_car">Diesel Car</option>
                <option value="ev">Electric Car (EV)</option>
                <option value="public_transit">Public Transit (Metro/Bus)</option>
                <option value="walk_cycle">Walk / Cycle</option>
              </select>
            </div>

            <Input
              id="dailyDistance"
              name="dailyDistance"
              label="Daily Distance (km)"
              type="number"
              min="0"
              max="500"
              value={formData.dailyDistance}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="dietType" className="text-sm font-semibold text-slate-300">
              Diet Pattern
            </label>
            <select
              id="dietType"
              name="dietType"
              value={formData.dietType}
              onChange={handleChange}
              className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald focus:outline-none text-slate-100 cursor-pointer"
            >
              <option value="omnivore">Omnivore (Heavy Meat Eating)</option>
              <option value="average_meat">Average Meat Eater</option>
              <option value="pescatarian">Pescatarian (Fish & Veg)</option>
              <option value="vegetarian">Vegetarian (Dairy, No Meat)</option>
              <option value="vegan">Vegan (Plant-Based)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="electricityUsage"
              name="electricityUsage"
              label="Electricity Usage (kWh/mo)"
              type="number"
              min="0"
              max="5000"
              value={formData.electricityUsage}
              onChange={handleChange}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="electricityType" className="text-sm font-semibold text-slate-300">
                Electricity Grid
              </label>
              <select
                id="electricityType"
                name="electricityType"
                value={formData.electricityType}
                onChange={handleChange}
                className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald focus:outline-none text-slate-100 cursor-pointer"
              >
                <option value="grid">Standard Grid (Coal/Gas Mix)</option>
                <option value="green">100% Renewable / Solar Grid</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="shoppingHabits" className="text-sm font-semibold text-slate-300">
              Shopping Habits
            </label>
            <select
              id="shoppingHabits"
              name="shoppingHabits"
              value={formData.shoppingHabits}
              onChange={handleChange}
              className="px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald focus:outline-none text-slate-100 cursor-pointer"
            >
              <option value="high">High Consumer (Frequent New Purchases)</option>
              <option value="moderate">Moderate Consumer (Normal/Balanced)</option>
              <option value="low">Minimalist (Buy Second-Hand/Needs-only)</option>
            </select>
          </div>

          {error && <p className="text-xs text-brand-danger font-medium">{error}</p>}

          <Button type="submit" loading={loading} className="w-full mt-2">
            Calculate Footprint
          </Button>
        </form>
      </Card>

      {/* Results View Card */}
      <Card className="md:col-span-6 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-brand-emerald rounded-full"></span>
            Footprint Calculation Results
          </h2>

          {!result ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
              <Calculator className="h-16 w-16 mb-4 text-slate-600 animate-bounce" />
              <p className="font-semibold text-sm">No calculations recorded yet.</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Enter your details and click calculate to view your carbon footprint parameters.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Score indicators */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Carbon Score</span>
                  <p className="text-3xl font-extrabold text-brand-emerald mt-1">{result.carbonScore}</p>
                  <span className="text-[10px] text-slate-500 font-semibold">1-100 Scale</span>
                </div>

                <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Footprint</span>
                  <p className="text-2xl font-extrabold text-slate-200 mt-1.5">
                    {result.totalEmissions}
                  </p>
                  <span className="text-[10px] text-slate-500 font-semibold">kg CO₂/mo</span>
                </div>

                <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Category</span>
                  <p className={`text-base font-extrabold mt-3.5 ${
                    result.classification === 'High' ? 'text-brand-danger' : result.classification === 'Low' ? 'text-brand-emerald' : 'text-brand-warning'
                  }`}>
                    {result.classification}
                  </p>
                </div>
              </div>

              {/* Custom SVG Bar Chart */}
              <div>
                <h3 className="text-xs uppercase text-slate-400 tracking-wider font-bold mb-3">Sector Contribution</h3>
                
                {/* Screen-reader descriptive text table */}
                <span className="sr-only">
                  Carbon emissions breakdown table:
                  Transportation emissions: {result.transportEmissions} kg.
                  Food emissions: {result.foodEmissions} kg.
                  Energy emissions: {result.energyEmissions} kg.
                  Lifestyle emissions: {result.lifestyleEmissions} kg.
                </span>

                <div className="flex flex-col gap-3.5" aria-hidden="true">
                  {/* Transportation */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Transportation</span>
                      <span className="text-slate-400">
                        {result.transportEmissions} kg ({getPct(result.transportEmissions, result.totalEmissions)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2">
                      <div 
                        className="bg-brand-emerald h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${getPct(result.transportEmissions, result.totalEmissions)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Food */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Food / Diet</span>
                      <span className="text-slate-400">
                        {result.foodEmissions} kg ({getPct(result.foodEmissions, result.totalEmissions)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2">
                      <div 
                        className="bg-brand-teal h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${getPct(result.foodEmissions, result.totalEmissions)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Energy */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Home Energy</span>
                      <span className="text-slate-400">
                        {result.energyEmissions} kg ({getPct(result.energyEmissions, result.totalEmissions)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2">
                      <div 
                        className="bg-brand-cyan h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${getPct(result.energyEmissions, result.totalEmissions)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Lifestyle */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Lifestyle / Goods</span>
                      <span className="text-slate-400">
                        {result.lifestyleEmissions} kg ({getPct(result.lifestyleEmissions, result.totalEmissions)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2">
                      <div 
                        className="bg-brand-warning h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${getPct(result.lifestyleEmissions, result.totalEmissions)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            <p className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-brand-emerald rounded-full"></span>
              Calculations are logged automatically. Submit new calculations as your habits improve.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
