import React from 'react';
import { Layout } from './components/Layout.jsx';
import { CarbonCalculator } from './components/CarbonCalculator.jsx';
import { AICoach } from './components/AICoach.jsx';
import { CarbonTwin } from './components/CarbonTwin.jsx';
import { ImpactSimulator } from './components/ImpactSimulator.jsx';
import { ProgressTracker } from './components/ProgressTracker.jsx';
import { EcoChallenges } from './components/EcoChallenges.jsx';
import { CommunityBenchmarking } from './components/CommunityBenchmarking.jsx';
import { ScenarioPlanner } from './components/ScenarioPlanner.jsx';
import { AuditLogViewer } from './components/AuditLogViewer.jsx';
import { ErrorBoundary } from './components/UI/ErrorBoundary.jsx';
import { api } from './services/api.js';
import type { UserStats, UserPersona } from '../shared/types.js';

interface ConfigResponse {
  ENABLE_AI: boolean;
  ENABLE_BENCHMARKING: boolean;
  ENABLE_SCENARIO_PLANNER: boolean;
  ENABLE_GAMIFICATION: boolean;
  ENABLE_CARBON_TWIN: boolean;
  GEMINI_STATUS: string;
}

export default function App() {
  const [activeTab, setActiveTab] = React.useState('calculator');
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [riskLevel, setRiskLevel] = React.useState<'Low' | 'Medium' | 'High' | null>(null);
  const [persona, setPersona] = React.useState<UserPersona | null>(null);
  const [config, setConfig] = React.useState<ConfigResponse | null>(null);

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
        {renderTabContent()}
      </ErrorBoundary>
    </Layout>
  );
}
