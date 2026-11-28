import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { API_BASE_URL, getErrorMessage } from '../../api/client';
import { getAdminMonitoring } from '../../api/adminApi';
import PlatformBadge from '../../components/PlatformBadge';
import { ErrorBox, LoadingRow, PANEL, Panel, Pill, SECONDARY_BUTTON, StatCard } from './ui';
import { formatAgo, formatDateTime, formatDuration, formatNumber, formatPercent } from './format';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const REFRESH_MS = 30000;

// Nhãn là câu tiếng Anh (khoá dịch) – dịch lúc hiển thị bằng t(...)
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
  const { t } = useTranslation();
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
      setError(err.response ? getErrorMessage(err, i18n.t('Couldn\'t load monitoring data.')) : i18n.t('Can\'t reach the backend server.'));
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
  if (!data) return <LoadingRow text={t("Loading monitoring data…")} />;

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
          {t("Counters since server start {{since}} (kept in memory) · updated {{updated}} · refreshes every 30s", { since: formatDateTime(data.metricsSince), updated: formatAgo(data.generatedAt) })}
          {error && <span className="ml-2 text-rose-700">· {t("last refresh failed")}</span>}
        </p>
        <button onClick={load} disabled={loading} className={SECONDARY_BUTTON}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          {loading ? t('Refreshing') : t('Refresh')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label={t("Requests to platforms")} value={formatNumber(totals.requests)}
          hint={t("Success rate {{rate}}", { rate: formatPercent(totals.requests - totals.failures, totals.requests) })} />
        <StatCard label={t("Failed requests")} value={formatNumber(totals.failures)}
          hint={totals.failures > 0 ? t('See recent errors below') : t('No errors since server start')} tone={totals.failures > 0 ? 'bad' : 'default'} />
        <StatCard label={t("Overdue / stale products")} value={`${formatNumber(overdue)} / ${formatNumber(stale)}`}
          hint={t("Past crawl schedule >15 min / no successful crawl >2 days")} tone={overdue + stale > 0 ? 'warn' : 'default'} />
        <StatCard label={t("Background jobs")} value={data.jobsError ? '?' : `${data.jobs.length - failedJobs}/${data.jobs.length} OK`}
          hint={data.jobCounts ? t("{{count}} failed jobs kept by Hangfire", { count: formatNumber(data.jobCounts.failed) }) : data.jobsError}
          tone={data.jobsError || failedJobs ? 'bad' : 'default'} />
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        {data.platforms.map(p => <PlatformCard key={p.platform} platform={p} />)}
      </div>

      <Panel
        title={t("Background jobs")}
        subtitle={t("Scheduled with Hangfire")}
        actions={
          <a href={`${API_BASE_URL}/hangfire`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4">
            {t("Open Hangfire dashboard")} <ExternalLink size={14} aria-hidden="true" />
          </a>
        }
      >
        {data.jobsError ? (
          <p className="text-sm text-rose-700">{data.jobsError}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">{t("Job")}</th>
                <th className="py-2 pr-4 font-medium">{t("Schedule")}</th>
                <th className="py-2 pr-4 font-medium">{t("Last run")}</th>
                <th className="py-2 pr-4 font-medium">{t("Status")}</th>
                <th className="py-2 font-medium">{t("Next run")}</th>
              </tr>
            </thead>
            <tbody>
              {data.jobs.map(job => (
                <tr key={job.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4">
                    <p className="text-slate-900">{JOB_LABELS[job.id] ? t(JOB_LABELS[job.id]) : job.id}</p>
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

      <Panel title={t("Recent errors")} subtitle={data.recentErrors.length ? t("Latest {{count}} failed requests, newest first", { count: data.recentErrors.length }) : t('Failed requests appear here')}>
        {data.recentErrors.length === 0 ? (
          <LoadingRow text={t("No errors since server start.")} />
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4 font-medium">{t("Time")}</th>
                  <th className="py-2 pr-4 font-medium">{t("Platform")}</th>
                  <th className="py-2 pr-4 font-medium">{t("Type")}</th>
                  <th className="py-2 pr-4 font-medium">{t("Target")}</th>
                  <th className="py-2 font-medium">{t("Error")}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentErrors.map((e, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 align-top">
                    <td className="py-2 pr-4 whitespace-nowrap text-slate-700" title={formatDateTime(e.at)}>{formatAgo(e.at)}</td>
                    <td className="py-2 pr-4"><PlatformBadge platform={e.platform} /></td>
                    <td className="py-2 pr-4 text-slate-700 whitespace-nowrap">{OPERATION_LABELS[e.operation] ? t(OPERATION_LABELS[e.operation]) : e.operation}</td>
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
  const { t } = useTranslation();
  if (!state) return <Pill>{t("Not run yet")}</Pill>;
  const tone = { Succeeded: 'good', Failed: 'bad', Processing: 'info', Enqueued: 'info', Scheduled: 'info' }[state] ?? 'default';
  return <Pill tone={tone}>{t(state)}</Pill>;
}

function PlatformCard({ platform: p }) {
  const { t } = useTranslation();
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
          <Pill tone={status.tone}>{t(status.text)}</Pill>
        </div>
        <p className="text-sm text-slate-500">{t("Last success {{when}}", { when: formatAgo(lastSuccess) })}</p>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-5">
        <MiniStat label={t("Tracked")} value={p.trackedProducts} />
        <MiniStat label={t("Overdue")} value={p.overdueProducts} warn />
        <MiniStat label={t("Stale")} value={p.staleProducts} warn />
        <MiniStat label={t("Out of stock")} value={p.outOfStockProducts} />
        <MiniStat label={t("Delisted")} value={p.delistedProducts ?? 0} warn />
      </div>

      {p.operations.length === 0 ? (
        <p className="text-sm text-slate-500">{t("No requests since server start.")}</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200">
              <th className="py-2 pr-2 font-medium">{t("Type")}</th>
              <th className="py-2 pr-2 font-medium text-right">{t("Requests")}</th>
              <th className="py-2 pr-2 font-medium text-right">{t("Success")}</th>
              <th className="py-2 pr-2 font-medium text-right">{t("Fallback")}</th>
              <th className="py-2 font-medium text-right">{t("Avg time")}</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {p.operations.map(o => (
              <tr key={o.operation} className="border-b border-slate-100 last:border-0 text-slate-700">
                <td className="py-2 pr-2">{OPERATION_LABELS[o.operation] ? t(OPERATION_LABELS[o.operation]) : o.operation}</td>
                <td className="py-2 pr-2 text-right">{formatNumber(o.requests)}</td>
                <td className={`py-2 pr-2 text-right ${o.failures > 0 ? 'text-amber-800 font-medium' : ''}`}>{formatPercent(o.successes, o.requests)}</td>
                <td className="py-2 pr-2 text-right" title={t("Succeeded only after switching to the backup strategy (Playwright)")}>{o.fallbackSuccesses > 0 ? formatPercent(o.fallbackSuccesses, o.requests) : '—'}</td>
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
