import React from 'react';
import { Card } from './UI/Card.jsx';
import { Button } from './UI/Button.jsx';
import { api } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import type { Challenge } from '../../shared/types.js';
import { Award, CheckCircle, Zap } from 'lucide-react';

interface EcoChallengesProps {
  onChallengeCompleted: () => void;
}

export function EcoChallenges({ onChallengeCompleted }: EcoChallengesProps) {
  const { data: challenges, loading, error, execute: reloadChallenges } = useFetch<Challenge[]>(
    () => api.listChallenges()
  );

  const [completingId, setCompletingId] = React.useState<string | null>(null);
  const [completeError, setCompleteError] = React.useState<string | null>(null);

  const handleComplete = async (id: string) => {
    setCompletingId(id);
    setCompleteError(null);
    try {
      await api.completeChallenge(id);
      await reloadChallenges();
      onChallengeCompleted();
    } catch (err: any) {
      setCompleteError(err.message || 'Failed to complete challenge.');
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Award className="h-8 w-8 text-brand-emerald animate-pulse" />
        <p className="text-xs font-semibold">Loading weekly eco-challenges...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-brand-danger bg-red-950/20 border border-brand-danger/30 rounded-xl p-4">{error}</p>;
  }

  if (!challenges || challenges.length === 0) {
    return (
      <Card className="text-center py-12 text-slate-400">
        <p className="font-semibold text-sm">No challenges available.</p>
      </Card>
    );
  }

  const completedCount = challenges.filter(c => c.completed).length;
  const progressPct = Math.round((completedCount / challenges.length) * 100);

  const categoryColors = {
    Transportation: 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20',
    Food: 'bg-brand-teal/10 text-brand-teal border-brand-teal/20',
    Energy: 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20',
    Lifestyle: 'bg-brand-warning/10 text-brand-warning border-brand-warning/20'
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Gamification progress card */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-emerald" />
            Weekly Eco Challenges
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete actionable challenges to earn eco points and unlock milestone credentials.
          </p>
        </div>

        {/* Circular SVG Progress chart */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16" role="img" aria-label={`Challenges completion progress: ${progressPct}%`}>
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="4" fill="transparent" />
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                stroke="#10b981" 
                strokeWidth="4" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 28} 
                strokeDashoffset={2 * Math.PI * 28 * (1 - progressPct / 100)}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-200">
              {progressPct}%
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">COMPLETED TASKS</span>
            <span className="text-sm font-extrabold text-slate-350">{completedCount} of {challenges.length} active</span>
          </div>
        </div>
      </Card>

      {completeError && (
        <p className="text-xs text-brand-danger bg-red-950/20 border border-brand-danger/30 rounded-xl p-3">
          {completeError}
        </p>
      )}

      {/* Grid of Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className={`flex flex-col justify-between gap-4 border ${
            challenge.completed ? 'border-brand-emerald/20 bg-slate-950/30' : 'border-slate-800/80 bg-slate-900/40'
          }`}>
            <div>
              <div className="flex justify-between items-start gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${categoryColors[challenge.category] || 'bg-slate-800'}`}>
                  {challenge.category}
                </span>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                  <Zap className="h-3 w-3 text-brand-emerald fill-brand-emerald/15" />
                  {challenge.points} pts
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-200 mt-2.5">{challenge.title}</h3>
              <p className="text-xs text-slate-400 mt-1.5 font-medium leading-relaxed">
                {challenge.description}
              </p>
            </div>

            <div className="flex justify-between items-center mt-2 border-t border-slate-900 pt-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Difficulty: {challenge.difficulty}</span>
              {challenge.completed ? (
                <span className="text-brand-emerald text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </span>
              ) : (
                <Button 
                  variant="secondary" 
                  className="text-xs py-1.5 cursor-pointer"
                  onClick={() => handleComplete(challenge.id)}
                  loading={completingId === challenge.id}
                >
                  Mark Completed
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
