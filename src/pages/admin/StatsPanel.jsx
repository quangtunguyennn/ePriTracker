import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bell, Package, PackageX, RefreshCw, Users } from 'lucide-react';
import { getErrorMessage } from '../../api/client';
import { getAdminStats } from '../../api/adminApi';
import PlatformBadge from '../../components/PlatformBadge';
import { formatDateTime, formatNumber, formatPrice } from './format';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

// Giao diện SaaS sáng (thử nghiệm). Màu theo skill dataviz: 3 chuỗi = 3 slot đầu của bảng màu đã kiểm định
// (validate_palette.js trên nền #ffffff: PASS, aqua < 3:1 → có chú thích + nút xem bảng). Chữ luôn dùng màu chữ, không dùng màu chuỗi.
const INK = { primary: '#0b0b0b', secondary: '#52514e', muted: '#898781', grid: '#e1e0d9', axis: '#c3c2b7' };
// name là câu tiếng Anh (khoá dịch) – dịch lúc hiển thị bằng t(s.name)
const SERIES = [
  { key: 'newProducts', name: 'New products', color: '#2a78d6' },
  { key: 'newUsers', name: 'New users', color: '#eb6834' },
  { key: 'notifications', name: 'Price alerts', color: '#1baf7a' },
];
const BAR = '#2a78d6'; // xếp hạng theo sàn: một màu (độ lớn), tên sàn đã có nhãn riêng

const CARD = 'bg-white rounded-xl border border-slate-200';

export default function StatsPanel() {
  const { t } = useTranslation();
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
      setError(err.response ? getErrorMessage(err, i18n.t('Couldn\'t load statistics.')) : i18n.t('Can\'t reach the backend server.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const daily = useMemo(
    () => (stats?.daily ?? []).map(d => ({ ...d, label: d.date.slice(5).split('-').reverse().join('/') })),
    [stats],
  );

  if (error) {
    return (
      <div className={`${CARD} p-8 text-center`}>
        <p className="text-sm text-rose-700">{error}</p>
        <button onClick={load} className="mt-4 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50">{t("Try again")}</button>
      </div>
    );
  }
  if (!stats) return <p className="py-10 text-center text-sm text-slate-500">{t("Loading statistics…")}</p>;

  const sum = (key, days = 7) => daily.slice(-days).reduce((s, d) => s + d[key], 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{t("Updated {{date}}", { date: formatDateTime(stats.generatedAt) })}</p>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          {loading ? t('Refreshing') : t('Refresh')}
        </button>
      </div>

      {/* KPI row – stat tile: nhãn, giá trị, thay đổi 7 ngày, sparkline 30 ngày (xám, điểm cuối màu nhấn) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile icon={Users} label={t("Users")} value={stats.totalUsers}
          delta={stats.newUsersLast7Days} deltaLabel={t("new in 7 days")} trend={daily.map(d => d.newUsers)} />
        <StatTile icon={Package} label={t("Tracked products")} value={stats.trackedProducts}
          delta={sum('newProducts')} deltaLabel={t("added in 7 days")} trend={daily.map(d => d.newProducts)}
          footnote={t("{{products}} in database · {{entries}} tracking entries", { products: formatNumber(stats.totalProducts), entries: formatNumber(stats.trackingEntries) })} />
        <StatTile icon={Bell} label={t("Price alerts sent")} value={stats.notificationsLast7Days} valueSuffix={t("last 7 days")}
          trend={daily.map(d => d.notifications)} footnote={t("{{count}} in total", { count: formatNumber(stats.totalNotifications) })} />
        <StatTile icon={PackageX} label={t("Out of stock")} value={stats.outOfStockProducts}
          footnote={stats.trackedProducts > 0 ? t("{{pct}}% of tracked products", { pct: Math.round((stats.outOfStockProducts / stats.trackedProducts) * 100) }) : null}
          warn={stats.outOfStockProducts > 0} />
      </div>

      {/* Bento: biểu đồ hoạt động chiếm 2 cột, xếp hạng theo sàn 1 cột */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ActivityCard daily={daily} />
        <PlatformCard platforms={stats.productsByPlatform} total={stats.trackedProducts} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ProductList
          title={t("Most tracked products")}
          subtitle={t("Products with the most people following them")}
          products={stats.topTracked}
          empty={t("No tracked products yet.")}
          value={p => <span className="tabular-nums">{p.trackers === 1 ? t('{{count}} user', { count: p.trackers }) : t('{{count}} users', { count: p.trackers })}</span>}
        />
        <ProductList
          title={t("Biggest price drops")}
          subtitle={t("Current price compared with 7 days ago")}
          products={stats.topPriceDrops}
          empty={t("No price drops in the last 7 days.")}
          value={p => (
            <span className="tabular-nums">
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[13px] font-semibold text-emerald-800">−{p.dropPercent}%</span>
              <span className="mt-1 block text-xs text-slate-500 line-through">{formatPrice(p.oldPrice)}</span>
            </span>
          )}
        />
      </div>
    </div>
  );
}

// ===== Stat tile =====

function StatTile({ icon: Icon, label, value, valueSuffix, delta, deltaLabel, trend, footnote, warn = false }) {
  const { t } = useTranslation();
  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon size={16} aria-hidden="true" className="text-slate-400" />
        {label}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-[32px] leading-none font-semibold text-slate-900">
          {formatNumber(value)}
          {valueSuffix && <span className="ml-2 text-sm font-normal text-slate-500">{valueSuffix}</span>}
        </p>
        {trend && <Sparkline values={trend} />}
      </div>
      <div className="mt-3 min-h-5 text-sm">
        {delta != null && (
          <span className={delta > 0 ? 'text-emerald-700' : 'text-slate-500'}>
            {delta > 0 ? '+' : ''}{formatNumber(delta)} <span className="text-slate-500">{deltaLabel}</span>
          </span>
        )}
        {warn && (
          <span className="inline-flex items-center gap-1.5 text-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
            {t("Needs a look")}
          </span>
        )}
        {footnote && <p className="text-xs text-slate-500 mt-1">{footnote}</p>}
      </div>
    </div>
  );
}

// 30 điểm, nét xám (de-emphasis), điểm cuối màu nhấn – chỉ để thấy xu hướng, không có trục
function Sparkline({ values }) {
  if (!values?.length) return null;
  const w = 96, h = 32, max = Math.max(1, ...values);
  const x = i => (i / (values.length - 1)) * (w - 4) + 2;
  const y = v => h - 3 - (v / max) * (h - 6);
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const last = values.length - 1;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="shrink-0">
      <polyline points={points} fill="none" stroke="#b4b2a9" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last)} cy={y(values[last])} r="3" fill="#2a78d6" stroke="#ffffff" strokeWidth="2" />
    </svg>
  );
}

// ===== Hoạt động 30 ngày: 3 đường, một trục (cùng đơn vị "số lượng/ngày"), crosshair + tooltip, chú thích, xem bảng =====

const RANGES = [7, 14, 30];

function ActivityCard({ daily: allDays }) {
  const { t } = useTranslation();
  const [showTable, setShowTable] = useState(false);
  const [range, setRange] = useState(14); // mặc định 14 ngày: một ngày nhập hàng loạt cũ không đè bẹp hoạt động gần đây
  const daily = allDays.slice(-range);
  const totals = SERIES.map(s => ({ ...s, total: daily.reduce((sum, d) => sum + d[s.key], 0) }));

  return (
    <section className={`${CARD} p-6 xl:col-span-2`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{t("Activity")}</h3>
          <p className="text-sm text-slate-500">{t("Per day, last {{count}} days (Vietnam time)", { count: range })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5" role="group" aria-label={t("Time range")}>
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)} aria-pressed={range === r}
                className={`px-2.5 py-1 rounded-md text-sm font-medium ${range === r ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {t("{{count}}d", { count: r })}
              </button>
            ))}
          </div>
          <button onClick={() => setShowTable(v => !v)} className="text-sm font-medium text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline">
            {showTable ? t('View chart') : t('View as table')}
          </button>
        </div>
      </div>

      {/* Chú thích: luôn có với ≥ 2 chuỗi; kèm tổng 30 ngày – chữ màu chữ, màu chuỗi chỉ ở vạch kế bên */}
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {totals.map(s => (
          <li key={s.key} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
            {t(s.name)}
            <span className="font-semibold text-slate-900 tabular-nums">{formatNumber(s.total)}</span>
          </li>
        ))}
      </ul>

      {showTable ? (
        <div className="mt-4 max-h-72 overflow-y-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-medium">{t("Date")}</th>
                {SERIES.map(s => <th key={s.key} className="px-3 py-2 text-right font-medium">{t(s.name)}</th>)}
              </tr>
            </thead>
            <tbody className="tabular-nums text-slate-700">
              {[...daily].reverse().map(d => (
                <tr key={d.date} className="border-t border-slate-100">
                  <td className="px-3 py-1.5">{d.label}</td>
                  {SERIES.map(s => <td key={s.key} className="px-3 py-1.5 text-right">{d[s.key]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke={INK.grid} vertical={false} />
              <XAxis dataKey="label" interval={range > 14 ? 4 : range > 7 ? 1 : 0} tick={{ fill: INK.muted, fontSize: 12 }} tickLine={false} axisLine={{ stroke: INK.axis }} />
              <YAxis allowDecimals={false} tick={{ fill: INK.muted, fontSize: 12 }} tickLine={false} axisLine={false} width={48} />
              <Tooltip content={<ActivityTooltip />} cursor={{ stroke: INK.axis, strokeWidth: 1 }} />
              {SERIES.map(s => (
                <Line key={s.key} type="linear" dataKey={s.key} name={t(s.name)} stroke={s.color} strokeWidth={2}
                  dot={false} activeDot={{ r: 4, fill: s.color, stroke: '#ffffff', strokeWidth: 2 }} strokeLinecap="round" strokeLinejoin="round" />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

// Một tooltip cho mọi chuỗi; giá trị đậm đứng trước, tên chuỗi phụ; khoá bằng vạch màu ngắn
function ActivityTooltip({ active, payload, label }) {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <p className="mb-1 text-xs text-slate-500">{label}</p>
      {SERIES.map(s => {
        const item = payload.find(p => p.dataKey === s.key);
        return (
          <p key={s.key} className="flex items-center gap-2 text-sm">
            <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
            <span className="font-semibold text-slate-900 tabular-nums">{item?.value ?? 0}</span>
            <span className="text-slate-500">{t(s.name)}</span>
          </p>
        );
      })}
    </div>
  );
}

// ===== Sàn: thanh ngang xếp hạng (thay biểu đồ tròn) – một màu, lớn nhất trước, tên + số + % mỗi dòng =====

function PlatformCard({ platforms, total }) {
  const { t } = useTranslation();
  const rows = [...platforms].sort((a, b) => b.products - a.products);
  const max = Math.max(1, ...rows.map(r => r.products));

  return (
    <section className={`${CARD} p-6`}>
      <h3 className="text-base font-semibold text-slate-900">{t("Tracked products by platform")}</h3>
      <p className="text-sm text-slate-500">{t("{{products}} products across {{platforms}} platforms", { products: formatNumber(total), platforms: rows.length })}</p>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">{t("No tracked products yet.")}</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {rows.map(r => {
            const share = total > 0 ? Math.round((r.products / total) * 100) : 0;
            return (
              <li key={r.platform} title={t("{{platform}}: {{count}} products ({{share}}%)", { platform: r.platform, count: r.products, share })}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <PlatformBadge platform={r.platform} />
                  <span className="text-slate-600 tabular-nums">
                    <span className="font-semibold text-slate-900">{formatNumber(r.products)}</span> · {share}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-100" role="img" aria-label={t("{{platform}} {{count}} products, {{share}} percent", { platform: r.platform, count: r.products, share })}>
                  <div className="h-3 rounded-full" style={{ width: `${(r.products / max) * 100}%`, backgroundColor: BAR }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ===== Danh sách sản phẩm (dạng bảng gọn, có thứ hạng) =====

const LIST_PREVIEW = 5;

function ProductList({ title, subtitle, products, empty, value }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? products : products.slice(0, LIST_PREVIEW);
  return (
    <section className={`${CARD} p-6`}>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500">{subtitle}</p>
      {products.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">{empty}</p>
      ) : (
        <ol className="mt-4 divide-y divide-slate-100">
          {shown.map((p, i) => (
            <li key={p.productId} className="flex items-center gap-3 py-3">
              <span className="w-5 text-right text-sm text-slate-500 tabular-nums">{i + 1}</span>
              <img src={p.imageURL} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 bg-white object-contain" />
              <div className="min-w-0 flex-1">
                <a href={p.productLink} target="_blank" rel="noreferrer" title={p.productName}
                  className="block truncate text-sm font-medium text-slate-900 hover:text-orange-600">
                  {p.productName}
                </a>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <PlatformBadge platform={p.platform} />
                  <span className="tabular-nums">{formatPrice(p.latestPrice)}</span>
                </div>
              </div>
              <div className="text-right text-sm text-slate-700 whitespace-nowrap">{value(p)}</div>
            </li>
          ))}
        </ol>
      )}
      {products.length > LIST_PREVIEW && (
        <button onClick={() => setExpanded(v => !v)} className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4">
          {expanded ? t('Show less') : t('Show all {{count}}', { count: products.length })}
        </button>
      )}
    </section>
  );
}
