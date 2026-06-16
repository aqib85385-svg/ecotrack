import React from 'react';
import { Layout } from './components/Layout.jsx';
import { ErrorBoundary } from './components/UI/ErrorBoundary.jsx';
import { api } from './services/api.js';
import type { UserStats, UserPersona, SystemConfig } from '../shared/types.js';

// Lazy-loaded components for optimal bundle sizes and startup performance
const CarbonCalculator = React.lazy(() => import('./components/CarbonCalculator.jsx').then(m => ({ default: m.CarbonCalculator })));
const AICoach = React.lazy(() => import('./components/AICoach.jsx').then(m => ({ default: m.AICoach })));
const CarbonTwin = React.lazy(() => import('./components/CarbonTwin.jsx').then(m => ({ default: m.CarbonTwin })));
const ImpactSimulator = React.lazy(() => import('./components/ImpactSimulator.jsx').then(m => ({ default: m.ImpactSimulator })));
const ProgressTracker = React.lazy(() => import('./components/ProgressTracker.jsx').then(m => ({ default: m.ProgressTracker })));
const EcoChallenges = React.lazy(() => import('./components/EcoChallenges.jsx').then(m => ({ default: m.EcoChallenges })));
const CommunityBenchmarking = React.lazy(() => import('./components/CommunityBenchmarking.jsx').then(m => ({ default: m.CommunityBenchmarking })));
const ScenarioPlanner = React.lazy(() => import('./components/ScenarioPlanner.jsx').then(m => ({ default: m.ScenarioPlanner })));
const AuditLogViewer = React.lazy(() => import('./components/AuditLogViewer.jsx').then(m => ({ default: m.AuditLogViewer })));

export default function App() {
  const [activeTab, setActiveTab] = React.useState('calculator');
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [riskLevel, setRiskLevel] = React.useState<'Low' | 'Medium' | 'High' | null>(null);
  const [persona, setPersona] = React.useState<UserPersona | null>(null);
  const [config, setConfig] = React.useState<SystemConfig | null>(null);

  const fetchConfig = React.useCallback(async () => {
    try {
      const data = await api.getConfig();
      setConfig(data);
    } catch (err) {
      console.error('Failed to load system config flags:', err);
    }
  }, []);

  const refreshUserData = React.useCallback(async () => {
    try {
      const data = await api.getHistory();
      setStats(data.stats);
      setRiskLevel(data.risk.level);
      
      if (data.history.length > 0) {
        setPersona(data.history[data.history.length - 1].persona);
      } else {
        setPersona(null);
      }
    } catch (err) {
      console.error('Failed to fetch historical profile data:', err);
    }
  }, []);

  React.useEffect(() => {
    fetchConfig();
    refreshUserData();
  }, [fetchConfig, refreshUserData]);

  const handleCalculationCompleted = () => {
    refreshUserData();
  };

  const handleChallengeCompleted = () => {
    refreshUserData();
  };

  // Render tab component based on tab selection
  const renderTabContent = () => {
    switch (activeTab) {
      case 'calculator':
        return (
          <CarbonCalculator 
            onCalculationCompleted={handleCalculationCompleted} 
            initialPersona={persona} 
          />
        );
      case 'coach':
        return config?.ENABLE_AI ? <AICoach /> : <p className="text-xs text-slate-500 font-mono">Coach disabled by system configurations.</p>;
      case 'twin':
        return config?.ENABLE_CARBON_TWIN ? <CarbonTwin /> : <p className="text-xs text-slate-500 font-mono">Twin projections disabled by configurations.</p>;
      case 'simulator':
        return <ImpactSimulator />;
      case 'tracker':
        return <ProgressTracker />;
      case 'challenges':
        return config?.ENABLE_GAMIFICATION ? (
          <EcoChallenges onChallengeCompleted={handleChallengeCompleted} />
        ) : (
          <p className="text-xs text-slate-500 font-mono">Gamification disabled by configurations.</p>
        );
      case 'benchmarks':
        return config?.ENABLE_BENCHMARKING ? <CommunityBenchmarking /> : <p className="text-xs text-slate-500 font-mono">Benchmarking disabled by configurations.</p>;
      case 'scenario':
        return config?.ENABLE_SCENARIO_PLANNER ? <ScenarioPlanner /> : <p className="text-xs text-slate-500 font-mono">Scenario Planner disabled by configurations.</p>;
      case 'audit':
        return <AuditLogViewer />;
      default:
        return <CarbonCalculator onCalculationCompleted={handleCalculationCompleted} initialPersona={persona} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      stats={stats}
      riskLevel={riskLevel}
      persona={persona}
      onRefresh={refreshUserData}
      config={config}
    >
      <ErrorBoundary>
        <React.Suspense fallback={
          <div className="py-20 text-center text-slate-500 font-mono text-xs animate-pulse">
            Loading panel...
          </div>
        }>
          {renderTabContent()}
        </React.Suspense>
      </ErrorBoundary>
    </Layout>
  );
}
