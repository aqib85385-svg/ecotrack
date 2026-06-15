import { Card } from './UI/Card.jsx';
import { api } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { Globe, Award } from 'lucide-react';

interface BenchmarkResponse {
  userFootprint: number;
  personaAverage: number;
  regionalAverage: number;
  globalAverage: number;
  comparisons: {
    label: string;
    value: number;
    percentageDifference: number;
  }[];
  communitySavings: number;
  ranking: number;
  totalUsers: number;
  leaderboard: {
    name: string;
    score: number;
    footprint: number;
  }[];
}

export function CommunityBenchmarking() {
  const { data, loading, error } = useFetch<BenchmarkResponse>(() => api.getBenchmark());

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Globe className="h-8 w-8 text-brand-emerald animate-pulse" />
        <p className="text-xs font-semibold">Calculating benchmark baselines...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-brand-danger bg-red-950/20 border border-brand-danger/30 rounded-xl p-4">{error}</p>;
  }

  if (!data) return null;

  const { userFootprint, comparisons, communitySavings, ranking, totalUsers, leaderboard } = data;

  // Max value to scale bar charts
  const maxBarValue = Math.max(userFootprint, ...comparisons.map(c => c.value), 400);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Comparisons and Bar Chart */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <Card>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand-emerald" />
            Emissions Benchmarking
          </h2>

          <div className="flex flex-col gap-5">
            {/* User Footprint highlight */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">YOUR FOOTPRINT</span>
                <span className="text-base font-extrabold text-slate-200">{userFootprint} kg CO₂ / month</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium max-w-[180px] text-right">
                Compared against reference baselines and platform aggregates.
              </span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visual Comparisons</h3>
              
              {/* Screen reader table description */}
              <span className="sr-only">
                Benchmarking details table:
                Your Footprint: {userFootprint} kg.
                {comparisons.map(c => `${c.label}: ${c.value} kg, difference: ${c.percentageDifference}%`).join('. ')}
              </span>

              <div className="flex flex-col gap-3.5" aria-hidden="true">
                {/* User footprint bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-brand-emerald font-bold">Your Footprint</span>
                    <span className="text-slate-350">{userFootprint} kg</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5">
                    <div 
                      className="bg-brand-emerald h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${(userFootprint / maxBarValue) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Other comparisons */}
                {comparisons.map((c, i) => {
                  const better = c.percentageDifference <= 0;
                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-350">{c.label}</span>
                        <div className="flex items-center gap-2 text-slate-400">
                          <span>{c.value} kg</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center ${
                            better ? 'bg-brand-emerald/15 text-brand-emerald' : 'bg-brand-danger/15 text-brand-danger'
                          }`}>
                            {better ? '-' : '+'}{Math.abs(c.percentageDifference)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2">
                        <div 
                          className="bg-slate-700 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(c.value / maxBarValue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Community Rankings / Leaders */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Community stats */}
        <Card className="flex flex-col gap-4">
          <h2 className="text-sm uppercase text-slate-400 tracking-wider font-bold">Community Impact</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl text-center">
              <span className="text-[9px] text-slate-500 font-bold block uppercase">SAVED CO₂</span>
              <span className="text-base font-extrabold text-brand-emerald">{communitySavings} kg</span>
              <span className="text-[9px] text-slate-500 font-semibold block">Platform wide</span>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl text-center">
              <span className="text-[9px] text-slate-500 font-bold block uppercase">LEADERBOARD RANK</span>
              <span className="text-base font-extrabold text-brand-teal">#{ranking}</span>
              <span className="text-[9px] text-slate-500 font-semibold block">of {totalUsers} users</span>
            </div>
          </div>

          <div className="bg-slate-900/20 border border-slate-850/80 rounded-xl p-3 text-[10px] text-slate-500 leading-relaxed font-semibold">
            <span className="text-slate-400 font-bold block mb-1">Benchmarking Sources:</span>
            Reference targets derived from the World Resource Institute (WRI), national averages (e.g. MoEFCC India, DEFRA UK), and aggregate calculation indices.
          </div>
        </Card>

        {/* Leaderboard Card */}
        <Card>
          <h2 className="text-sm uppercase text-slate-400 tracking-wider font-bold mb-3 flex items-center gap-1">
            <Award className="h-4 w-4 text-brand-warning fill-brand-warning/15" />
            Platform Leaderboard
          </h2>

          <div className="space-y-2.5">
            {leaderboard.map((player, idx) => {
              const isUser = player.name.includes('You');
              return (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isUser 
                      ? 'bg-brand-emerald/10 border-brand-emerald/20 shadow-sm' 
                      : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      idx === 0 ? 'bg-brand-warning text-slate-950' : idx === 1 ? 'bg-slate-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`font-semibold ${isUser ? 'text-brand-emerald font-bold' : 'text-slate-300'}`}>
                      {player.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-200 block">{player.footprint} kg/mo</span>
                    <span className="text-[9px] text-slate-500 block">Score: {player.score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
