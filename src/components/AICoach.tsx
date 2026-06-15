import React from 'react';
import { Card } from './UI/Card.jsx';
import { Button } from './UI/Button.jsx';
import { api } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import type { Recommendation, WeeklyReport } from '../../shared/types.js';
import { Sparkles, Calendar, TrendingDown, ShieldAlert } from 'lucide-react';

export function AICoach() {
  const { 
    data: recommendations, 
    loading: recLoading, 
    error: recError, 
    execute: reloadRecs 
  } = useFetch<Recommendation[]>(() => api.getRecommendations());

  const [report, setReport] = React.useState<WeeklyReport | null>(null);
  const [reportLoading, setReportLoading] = React.useState(false);
  const [reportError, setReportError] = React.useState<string | null>(null);

  // Load existing reports if any
  const { data: reportHistory, execute: reloadHistory } = useFetch<WeeklyReport[]>(
    () => api.getReports(),
    true
  );

  React.useEffect(() => {
    if (reportHistory && reportHistory.length > 0) {
      setReport(reportHistory[0]); // show latest
    }
  }, [reportHistory]);

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportError(null);
    try {
      const newReport = await api.generateReport();
      setReport(newReport);
      reloadHistory();
    } catch (err: any) {
      setReportError(err.message || 'Failed to generate weekly report.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* AI Recommendations Section */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="w-1.5 h-4 bg-brand-emerald rounded-full"></span>
            AI Action Engine Prioritization
          </h2>
          <Button variant="ghost" className="text-xs" onClick={reloadRecs} disabled={recLoading}>
            Refresh Actions
          </Button>
        </div>

        {recLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Sparkles className="h-8 w-8 text-brand-emerald animate-spin" />
            <p className="text-xs font-semibold">Running Action Prioritization Engine...</p>
          </div>
        ) : recError ? (
          <p className="text-xs text-brand-danger bg-red-950/20 border border-brand-danger/30 rounded-xl p-4">{recError}</p>
        ) : !recommendations || recommendations.length === 0 ? (
          <Card className="text-center py-12 text-slate-400">
            <p className="font-semibold text-sm">No calculations recorded.</p>
            <p className="text-xs text-slate-500 mt-1">Submit your carbon calculations to trigger the AI engine.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {recommendations.map((rec, idx) => (
              <Card key={rec.id || idx} className="glass-panel-hover border-l-4 border-l-brand-emerald">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="bg-slate-900 border border-slate-800 text-slate-350 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {rec.category}
                    </span>
                    <h3 className="font-bold text-base text-slate-100 mt-2">{rec.action}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">Priority Score</span>
                    <span className="text-2xl font-extrabold text-brand-emerald">{rec.priorityScore}/100</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3 font-medium leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                  {rec.reason}
                </p>

                {/* Sub-parameters */}
                <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                  <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-bold block">CO₂ Savings</span>
                    <span className="text-xs font-bold text-slate-350">{rec.annualCo2Savings} kg/yr</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-bold block">Financial Savings</span>
                    <span className="text-xs font-bold text-slate-350">₹{rec.annualSavings.toLocaleString('en-IN')}/yr</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-bold block">ROI Level</span>
                    <span className="text-xs font-bold text-brand-teal">{rec.roi}</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-bold block">Difficulty</span>
                    <span className="text-xs font-bold text-slate-300">{rec.difficulty}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* AI Report Section */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="w-1.5 h-4 bg-brand-teal rounded-full"></span>
          Weekly AI Sustainability Coach
        </h2>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Generate an AI analysis of your trends, risks, and forecasts.
            </p>
            <Button 
              variant="primary" 
              onClick={handleGenerateReport} 
              loading={reportLoading}
              className="text-xs shrink-0 cursor-pointer font-bold px-3 py-2"
            >
              Generate Report
            </Button>
          </div>

          {reportError && (
            <p className="text-xs text-brand-danger bg-red-950/20 border border-brand-danger/30 rounded-xl p-3">
              {reportError}
            </p>
          )}

          {report ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="border-t border-slate-800/80 pt-4 grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex items-center gap-2.5">
                  <TrendingDown className="h-5 w-5 text-brand-emerald" />
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold block">BEST IMPROVEMENT</span>
                    <span className="text-xs font-semibold text-slate-200">{report.bestImprovement}</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex items-center gap-2.5">
                  <ShieldAlert className="h-5 w-5 text-brand-warning" />
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold block">BIGGEST CONCERN</span>
                    <span className="text-xs font-semibold text-slate-200">{report.biggestConcern}</span>
                  </div>
                </div>
              </div>

              {/* Main Report Details */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-teal">
                  <Sparkles className="h-4 w-4" />
                  <span>AI COACH STRATEGY INSIGHTS</span>
                </div>
                
                <div className="text-xs text-slate-300 leading-relaxed font-medium space-y-3 whitespace-pre-line">
                  {report.formattedReport}
                </div>
              </div>

              {/* Forecast assumptions */}
              <div className="text-[10px] text-slate-500 font-medium bg-slate-900/30 border border-slate-850 p-2.5 rounded-lg">
                <span className="font-bold text-slate-400 block mb-1">Forecast Projection:</span>
                {report.carbonTwinProjections}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold mt-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>Generated at: {new Date(report.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
              <Sparkles className="h-10 w-10 mx-auto mb-2 text-slate-650" />
              <p className="text-xs font-semibold">No report generated yet.</p>
              <p className="text-[10px] text-slate-600 mt-1">Click the button above to construct your weekly strategy report.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
