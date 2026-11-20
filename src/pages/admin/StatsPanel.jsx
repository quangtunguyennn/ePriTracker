import { useCallback, useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getErrorMessage } from '../../api/client';
import { getAdminStats } from '../../api/adminApi';
import PlatformBadge from '../../components/PlatformBadge';
import { ErrorBox, LoadingRow, Panel, StatCard } from './ui';
import { formatDateTime, formatNumber, formatPrice } from './format';

// Màu theo sàn (khớp tông PlatformBadge), sàn lạ dùng màu xám
const PLATFORM_COLORS = { Tiki: '#0ea5e9', CellphoneS: '#f43f5e', HACOM: '#3b82f6', GearVN: '#ef4444' };
const SERIES = [
  { key: 'newProducts', name: 'New products', color: '#f97316' },
  { key: 'newUsers', name: 'New users', color: '#22d3ee' },
  { key: 'notifications', name: 'Notifications', color: '#a78bfa' },
];

const TOOLTIP_STYLE = { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0' };

// Tab "Dashboard": tình hình sử dụng hệ thống (đọc DB, không cần tự làm mới)
export default function StatsPanel() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await getAdminStats());
    } catch (err) {
      console.error(err);
      setError(err.response ? getErrorMessage(err, 'Failed to load statistics.') : 'Unable to connect to the backend server!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!stats) return <LoadingRow />;

  const daily = stats.daily.map(d => ({ ...d, label: d.date.slice(5).split('-').reverse().join('/') }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-syne text-slate-500">Updated {formatDateTime(stats.generatedAt)}</p>
        <button onClick={load} disabled={loading} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 text-xs font-bold hover:bg-slate-800 disabled:opacity-50">
          {loading ? 'REFRESHING...' : 'REFRESH'}
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Users" value={formatNumber(stats.totalUsers)} hint={`+${formatNumber(stats.newUsersLast7Days)} in the last 7 days`} />
        <StatCard label="Tracked products" value={formatNumber(stats.trackedProducts)} hint={`${formatNumber(stats.totalProducts)} products in database`} />
        <StatCard label="Tracking entries" value={formatNumber(stats.trackingEntries)} hint="One user tracking one product = 1" />
        <StatCard label="Price alerts sent" value={formatNumber(stats.notificationsLast7Days)} hint={`Last 7 days · ${formatNumber(stats.totalNotifications)} in total`} />
        <StatCard label="Out of stock" value={formatNumber(stats.outOfStockProducts)} hint="Tracked products currently out of stock" tone={stats.outOfStockProducts > 0 ? 'warn' : 'default'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Panel title="Activity (last 30 days)" subtitle="New products, new users and price alerts per day (Vietnam time)" className="xl:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} interval={4} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {SERIES.map(s => (
                  <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} fill={s.color} fillOpacity={0.15} strokeWidth={2} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Tracked products by platform">
          {stats.productsByPlatform.length === 0 ? (
            <LoadingRow text="No tracked products yet." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.productsByPlatform} dataKey="products" nameKey="platform" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {stats.productsByPlatform.map(p => <Cell key={p.platform} fill={PLATFORM_COLORS[p.platform] ?? '#64748b'} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel title="Most tracked products">
          <ProductTable products={stats.topTracked} empty="No tracked products yet." renderValue={p => `${p.trackers} ${p.trackers === 1 ? 'user' : 'users'}`} />
        </Panel>
        <Panel title="Biggest price drops (7 days)" subtitle="Current price compared with the price 7 days ago">
          <ProductTable
            products={stats.topPriceDrops}
            empty="No price drops in the last 7 days."
            renderValue={p => (
              <span className="text-emerald-400 font-bold">-{p.dropPercent}%
                <span className="block text-[11px] font-normal text-slate-500 line-through">{formatPrice(p.oldPrice)}</span>
              </span>
            )}
          />
        </Panel>
      </div>
    </div>
  );
}

function ProductTable({ products, empty, renderValue }) {
  if (!products.length) return <LoadingRow text={empty} />;
  return (
    <ul className="divide-y divide-slate-700/40">
      {products.map(p => (
        <li key={p.productId} className="flex items-center gap-4 py-3">
          <img src={p.imageURL} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-700 bg-white" />
          <div className="flex-1 min-w-0">
            <a href={p.productLink} target="_blank" rel="noreferrer" className="block truncate text-sm text-white hover:text-cyan-300" title={p.productName}>
              {p.productName}
            </a>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <PlatformBadge platform={p.platform} />
              <span>{formatPrice(p.latestPrice)}</span>
            </div>
          </div>
          <div className="text-right text-sm font-syne text-slate-300 whitespace-nowrap">{renderValue(p)}</div>
        </li>
      ))}
    </ul>
  );
}
