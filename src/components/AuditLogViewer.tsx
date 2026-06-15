import { Card } from './UI/Card.jsx';
import { Button } from './UI/Button.jsx';
import { api } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import type { AuditLog } from '../../shared/types.js';
import { Terminal, RefreshCw } from 'lucide-react';

export function AuditLogViewer() {
  const { data: logs, loading, error, execute: reloadLogs } = useFetch<AuditLog[]>(
    () => api.getAuditLogs()
  );

  return (
    <Card className="animate-fade-in bg-slate-950/80 border border-slate-900 shadow-2xl flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-brand-emerald" />
          <h2 className="text-base font-bold font-mono tracking-tight text-slate-100">
            Audit Trail Logs Terminal
          </h2>
        </div>
        <Button variant="ghost" className="text-xs p-1" onClick={reloadLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <p className="text-[11px] text-slate-500 leading-normal font-mono">
        This view displays real-time compliance events recorded inside server-side databases (db.json) for auditing transactions.
      </p>

      {error && <p className="text-xs text-brand-danger font-semibold">{error}</p>}

      {/* Terminal View log rows */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 h-[350px] overflow-y-auto font-mono text-xs text-slate-350 space-y-3.5 pr-2">
        {loading && logs === null ? (
          <p className="text-slate-600 italic">Querying audit trail database...</p>
        ) : !logs || logs.length === 0 ? (
          <p className="text-slate-600 italic">Audit log file is empty.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="pb-3 border-b border-slate-900/60 last:border-0 flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className="bg-slate-900 border border-slate-800 text-[10px] px-1.5 py-0.5 rounded font-bold text-brand-teal">
                    {log.eventType}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">ID: {log.id}</span>
              </div>
              <div className="pl-2.5 border-l-2 border-slate-800/80 text-[11px] text-slate-400 font-sans">
                <span className="font-bold text-slate-500 text-[10px] block font-mono">METADATA:</span>
                <pre className="font-mono text-[10px] text-slate-300 mt-1 whitespace-pre-wrap overflow-x-auto bg-slate-900/20 p-2 rounded border border-slate-900/60 max-w-full">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
