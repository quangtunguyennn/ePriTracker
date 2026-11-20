import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { API_BASE_URL, getErrorMessage } from '../../api/client';
import { getAdminMonitoring } from '../../api/adminApi';
import PlatformBadge from '../../components/PlatformBadge';
import { ErrorBox, LoadingRow, PANEL, Panel, Pill, SECONDARY_BUTTON, StatCard } from './ui';
import { formatAgo, formatDateTime, formatDuration, formatNumber, formatPercent } from './format';

const REFRESH_MS = 30000;

const OPERATION_LABELS = {
  Product: 'Product page',
  Search: 'Search (suggestions)',
  BatchPrice: 'Batch prices',
  Events: 'Events',
};

const JOB_LABELS = {
  'adaptive-price-crawler-job': 'Price crawler (tier-based, every minute)',
  'refresh-event-cache-job': 'Tiki event products cache',
  'sync-auto-events-job': 'Auto events sync (CellphoneS, HACOM, GearVN)',
};

// Tab "Scraper Monitoring": tự làm mới mỗi 30 giây khi đang mở tab
export default function MonitoringPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return; // lượt trước chưa xong thì bỏ qua lượt tự làm mới
    loadingRef.current = true;
    setLoading(true);
    try {
      setData(await getAdminMonitoring());
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response ? getErrorMessage(err, 'Couldn\'t load monitoring data.') : 'Can\'t reach the backend server.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  if (error && !data) return <ErrorBox message={error} onRetry={load} />;
  if (!data) return <LoadingRow text="Loading monitoring data…" />;

  const totals = data.platforms.flatMap(p => p.operations).reduce(
    (acc, o) => ({ requests: acc.requests + o.requests, failures: acc.failures + o.failures }),
    { requests: 0, failures: 0 },
  );
  const failedJobs = data.jobs.filter(j => j.lastState === 'Failed').length;
  const overdue = data.platforms.reduce((sum, p) => sum + p.overdueProducts, 0);
  const stale = data.platforms.reduce((sum, p) => sum + p.staleProducts, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Counters since server start {formatDateTime(data.metricsSince)} (kept in memory) · updated {formatAgo(data.generatedAt)} · refreshes every 30s
          {error && <span className="ml-2 text-rose-700">· last refresh failed</span>}
        </p>
        <button onClick={load} disabled={loading} className={SECONDARY_BUTTON}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          {loading ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Requests to platforms" value={formatNumber(totals.requests)}
          hint={`Success rate ${formatPercent(totals.requests - totals.failures, totals.requests)}`} />
        <StatCard label="Failed requests" value={formatNumber(totals.failures)}
          hint={totals.failures > 0 ? 'See recent errors below' : 'No errors since server start'} tone={totals.failures > 0 ? 'bad' : 'default'} />
        <StatCard label="Overdue / stale products" value={`${formatNumber(overdue)} / ${formatNumber(stale)}`}
          hint="Past crawl schedule >15 min / no successful crawl >2 days" tone={overdue + stale > 0 ? 'warn' : 'default'} />
        <StatCard label="Background jobs" value={data.jobsError ? '?' : `${data.jobs.length - failedJobs}/${data.jobs.length} OK`}
          hint={data.jobCounts ? `${formatNumber(data.jobCounts.failed)} failed jobs kept by Hangfire` : data.jobsError}
          tone={data.jobsError || failedJobs ? 'bad' : 'default'} />
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        {data.platforms.map(p => <PlatformCard key={p.platform} platform={p} />)}
      </div>

      <Panel
        title="Background jobs"
        subtitle="Scheduled with Hangfire"
        actions={
          <a href={`${API_BASE_URL}/hangfire`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4">
            Open Hangfire dashboard <ExternalLink size={14} aria-hidden="true" />
          </a>
        }
      >
        {data.jobsError ? (
          <p className="text-sm text-rose-700">{data.jobsError}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Job</th>
                <th className="py-2 pr-4 font-medium">Schedule</th>
                <th className="py-2 pr-4 font-medium">Last run</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Next run</th>
              </tr>
            </thead>
            <tbody>
              {data.jobs.map(job => (
                <tr key={job.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4">
                    <p className="text-slate-900">{JOB_LABELS[job.id] ?? job.id}</p>
                    <p className="text-xs text-slate-500">{job.id}</p>
                    {job.error && <p className="text-xs text-rose-700">{job.error}</p>}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-600">{job.cron}</td>
                  <td className="py-3 pr-4 text-slate-700" title={formatDateTime(job.lastExecution)}>{formatAgo(job.lastExecution)}</td>
                  <td className="py-3 pr-4"><JobState state={job.lastState} /></td>
                  <td className="py-3 text-slate-700" title={formatDateTime(job.nextExecution)}>{formatAgo(job.nextExecution)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Recent errors" subtitle={data.recentErrors.length ? `Latest ${data.recentErrors.length} failed requests, newest first` : 'Failed requests appear here'}>
        {data.recentErrors.length === 0 ? (
          <LoadingRow text="No errors since server start." />
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 pr-4 font-medium">Platform</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Target</th>
                  <th className="py-2 font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {data.recentErrors.map((e, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 align-top">
                    <td className="py-2 pr-4 whitespace-nowrap text-slate-700" title={formatDateTime(e.at)}>{formatAgo(e.at)}</td>
                    <td className="py-2 pr-4"><PlatformBadge platform={e.platform} /></td>
                    <td className="py-2 pr-4 text-slate-700 whitespace-nowrap">{OPERATION_LABELS[e.operation] ?? e.operation}</td>
                    <td className="py-2 pr-4 text-slate-500 break-all max-w-xs">{e.target}</td>
                    <td className="py-2 text-rose-700 break-words max-w-md">{e.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function JobState({ state }) {
  if (!state) return <Pill>Not run yet</Pill>;
  const tone = { Succeeded: 'good', Failed: 'bad', Processing: 'info', Enqueued: 'info', Scheduled: 'info' }[state] ?? 'default';
  return <Pill tone={tone}>{state}</Pill>;
}

function PlatformCard({ platform: p }) {
  const requests = p.operations.reduce((sum, o) => sum + o.requests, 0);
  const failures = p.operations.reduce((sum, o) => sum + o.failures, 0);
  const lastSuccess = p.operations.map(o => o.lastSuccessAt).filter(Boolean).sort().at(-1);
  const status = requests === 0 ? { tone: 'default', text: 'No data yet' }
    : failures === 0 ? { tone: 'good', text: 'Healthy' }
    : failures / requests > 0.2 ? { tone: 'bad', text: 'Failing' }
    : { tone: 'warn', text: 'Some errors' };

  return (
    <section className={`${PANEL} p-6`}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <PlatformBadge platform={p.platform} />
          <Pill tone={status.tone}>{status.text}</Pill>
        </div>
        <p className="text-sm text-slate-500">Last success {formatAgo(lastSuccess)}</p>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-5">
        <MiniStat label="Tracked" value={p.trackedProducts} />
        <MiniStat label="Overdue" value={p.overdueProducts} warn />
        <MiniStat label="Stale" value={p.staleProducts} warn />
        <MiniStat label="Out of stock" value={p.outOfStockProducts} />
        <MiniStat label="Delisted" value={p.delistedProducts ?? 0} warn />
      </div>

      {p.operations.length === 0 ? (
        <p className="text-sm text-slate-500">No requests since server start.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200">
              <th className="py-2 pr-2 font-medium">Type</th>
              <th className="py-2 pr-2 font-medium text-right">Requests</th>
              <th className="py-2 pr-2 font-medium text-right">Success</th>
              <th className="py-2 pr-2 font-medium text-right">Fallback</th>
              <th className="py-2 font-medium text-right">Avg time</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {p.operations.map(o => (
              <tr key={o.operation} className="border-b border-slate-100 last:border-0 text-slate-700">
                <td className="py-2 pr-2">{OPERATION_LABELS[o.operation] ?? o.operation}</td>
                <td className="py-2 pr-2 text-right">{formatNumber(o.requests)}</td>
                <td className={`py-2 pr-2 text-right ${o.failures > 0 ? 'text-amber-800 font-medium' : ''}`}>{formatPercent(o.successes, o.requests)}</td>
                <td className="py-2 pr-2 text-right" title="Succeeded only after switching to the backup strategy (Playwright)">{o.fallbackSuccesses > 0 ? formatPercent(o.fallbackSuccesses, o.requests) : '—'}</td>
                <td className="py-2 text-right">{formatDuration(o.averageDurationMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function MiniStat({ label, value, warn = false }) {
  const flagged = warn && value > 0;
  return (
    <div className={`rounded-lg border px-2 py-2.5 text-center ${flagged ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
      <p className={`text-lg font-semibold leading-none ${flagged ? 'text-amber-800' : 'text-slate-900'}`}>{formatNumber(value)}</p>
      <p className="mt-1.5 text-[11px] text-slate-500">{label}</p>
    </div>
  );
}
