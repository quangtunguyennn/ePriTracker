import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useId, useMemo } from "react";
import axios from "axios";
import {
  addProduct,
  getProduct,
  getSuggestions,
  refreshSuggestions,
} from "../api/productApi";
import {
  RefreshCw,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Play,
  ExternalLink,
  Search,
} from "lucide-react";
import PlatformBadge from "../components/PlatformBadge";
import StockBadge from "../components/StockBadge";
import { getPlatformFromUrl } from "../utils/platform";
import toast, { Toaster } from "react-hot-toast"; // 🟢 Import react-hot-toast
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

/* =====================================================================
 *  BASE URL của API
 *  (trước đây dùng `BASE_URL` mà chưa khai báo -> ReferenceError, bị catch nuốt nên
 *   biểu đồ giá và video không bao giờ có dữ liệu)
 *  Ưu tiên: biến môi trường Vite -> baseURL mặc định của axios -> localhost swagger.
 *  Tính lúc gọi (không phải lúc import) để nhận được axios.defaults.baseURL đặt ở main.jsx.
 * ===================================================================== */
const getBaseUrl = () =>
  (
    import.meta.env?.VITE_API_URL ||
    import.meta.env?.VITE_API_BASE_URL ||
    axios.defaults.baseURL ||
    "https://localhost:44338"
  ).replace(/\/+$/, "");

/* =====================================================================
 *  PRICE HISTORY — helpers
 * ===================================================================== */
const DAY = 86_400_000;
const HOUR = 3_600_000;
const RANGES = [7, 30, 90];
const MAX_POINTS = 400; // nhiều hơn thì gộp theo ngày để biểu đồ mượt
const ORANGE = "#f97316";
const GREEN = "#059669";

const vnd = (n) => `${Math.round(n).toLocaleString("vi-VN")} ₫`;

// 12.500.000 -> "12.5M", 850.000 -> "850K"
const compactVnd = (n) => {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}`;
};

const shortDate = (t) =>
  new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const longDate = (t) =>
  new Date(t).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Trục Y "đẹp": bước tròn (1/2/2.5/5 × 10^n) và luôn có đệm — giá phẳng vẫn nằm giữa biểu đồ
function niceAxis(lo, hi) {
  const span = Math.max(hi - lo, hi * 0.04);
  const mid = (hi + lo) / 2;
  const rawStep = (span * 1.4) / 4;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rawStep) ?? 10 * mag;
  const min = Math.max(0, Math.floor((mid - span * 0.7) / step) * step);
  const max = Math.ceil((mid + span * 0.7) / step) * step;
  const ticks = [];
  for (let v = min; v <= max + step / 2; v += step) ticks.push(Math.round(v));
  return { domain: [min, max], ticks };
}

function buildChartModel(data, days) {
  const raw = (data?.points ?? [])
    .map((p) => ({ t: new Date(p.checkedAt).getTime(), price: Number(p.price) }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.price) && p.price > 0)
    .sort((a, b) => a.t - b.t);
  if (raw.length === 0) return null;

  const first = raw[0];
  const last = raw[raw.length - 1];
  const now = Date.now();
  const end = Math.max(now, last.t);
  const start = end - days * DAY; // trục X luôn phủ đúng khoảng người dùng chọn

  const current = data.currentPrice > 0 ? data.currentPrice : last.price;
  let low = data.lowestPrice > 0 ? data.lowestPrice : Math.min(...raw.map((p) => p.price));
  let high = data.highestPrice > 0 ? data.highestPrice : Math.max(...raw.map((p) => p.price));
  low = Math.min(low, current);
  high = Math.max(high, current);

  // Lần gần nhất giá chạm đáy / đỉnh (để ghi ngày)
  const lastTimeAt = (price) => {
    for (let i = raw.length - 1; i >= 0; i--) if (raw[i].price === price) return raw[i].t;
    return null;
  };

  // Chuỗi vẽ: quá nhiều điểm (crawl theo giờ) thì lấy giá cuối cùng của mỗi ngày
  let series = raw;
  if (series.length > MAX_POINTS) {
    const byDay = new Map();
    for (const p of series) byDay.set(new Date(p.t).toDateString(), p);
    series = [...byDay.values()];
  }
  // Giá vẫn còn hiệu lực đến bây giờ -> kéo đường tới mép phải
  const lastS = series[series.length - 1];
  if (end - lastS.t > 6 * HOUR) series = [...series, { t: end, price: current, isNow: true }];

  const { domain, ticks: yTicks } = niceAxis(low, high);

  const n = days === 7 ? 7 : 6;
  const xTicks = Array.from({ length: n }, (_, i) => Math.round(start + ((end - start) * i) / (n - 1)));

  return {
    raw,
    series,
    current,
    low,
    high,
    lowAt: lastTimeAt(low),
    highAt: lastTimeAt(high),
    first,
    last,
    start,
    end,
    domain,
    yTicks,
    xTicks,
    markers: raw.length <= 40 ? raw.filter((p) => p.t >= start) : [],
    startedLate: first.t - start > DAY, // lịch sử ngắn hơn khoảng đang chọn
  };
}

/* =====================================================================
 *  PRICE HISTORY — components
 * ===================================================================== */
function StatCard({ label, value, hint, tone = "neutral", icon }) {
  const tones = {
    neutral: "bg-slate-50 border-slate-100 text-slate-900",
    good: "bg-emerald-50 border-emerald-100 text-emerald-700",
    bad: "bg-rose-50 border-rose-100 text-rose-700",
  };
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 min-w-0 ${tones[tone]}`}>
      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider opacity-70 mb-1.5 flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p
        title={value}
        className="text-xl sm:text-2xl font-black font-questrial leading-tight truncate"
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs font-medium opacity-70 truncate">{hint}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, lowest, showLowest }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-white/95 backdrop-blur p-3.5 border border-slate-200 shadow-xl rounded-xl min-w-[170px]">
      <p className="text-slate-500 text-xs mb-1">{point.isNow ? "Now" : longDate(point.t)}</p>
      <p className="text-orange-600 font-black text-lg font-questrial">{vnd(point.price)}</p>
      {showLowest && point.price === lowest && (
        <span className="mt-1.5 inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
          Lowest in period
        </span>
      )}
    </div>
  );
}

function PriceHistorySection({ data, loading, error, days, loadedDays, onChangeDays, onRetry }) {
  const gradientId = useId().replace(/:/g, "");
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Dùng khoảng ngày của dữ liệu ĐÃ tải (không phải nút vừa bấm) để biểu đồ không "nhảy" khi đang chờ
  const model = useMemo(() => buildChartModel(data, loadedDays), [data, loadedDays]);
  const refreshing = loading && !!model;

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
          <Activity className="w-5 h-5 text-orange-600" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-questrial leading-tight">
            Price History
          </h2>
          <p className="text-sm text-slate-500">Last {days} days</p>
        </div>
      </div>

      <div
        role="group"
        aria-label="Time range"
        className="inline-flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100 self-start sm:self-auto"
      >
        {RANGES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onChangeDays(d)}
            aria-pressed={days === d}
            aria-label={`${d} days`}
            className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-sm font-questrial font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
              days === d ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {d} Days
          </button>
        ))}
      </div>
    </div>
  );

  const shell = (children, busy = false) => (
    <section
      id="pricechart"
      aria-busy={busy}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10"
    >
      {header}
      {children}
    </section>
  );

  /* ---- lần tải đầu: skeleton đúng bố cục ---- */
  if (loading && !model) {
    return (
      <div
        className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 animate-pulse"
        aria-busy="true"
        aria-label="Loading price history"
      >
        <div className="flex justify-between mb-8">
          <div className="h-10 w-48 bg-slate-100 rounded-xl" />
          <div className="h-10 w-56 bg-slate-100 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
          ))}
        </div>
        <div className="h-[300px] sm:h-[360px] bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  /* ---- lỗi ---- */
  if (error) {
    return shell(
      <div className="bg-red-50 border border-red-100 rounded-2xl text-center py-12 px-4">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2 bg-white text-red-600 border border-red-200 rounded-xl font-semibold hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" /> Try again
        </button>
      </div>,
    );
  }

  /* ---- chưa có điểm giá nào ---- */
  if (!model) {
    return shell(
      <div className="bg-slate-50 rounded-2xl text-center py-14 px-4 border border-slate-100 border-dashed">
        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
        <p className="text-slate-700 font-semibold mb-1">No price data in the last {days} days</p>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          We check prices regularly. Try a longer range, or come back later.
        </p>
      </div>,
    );
  }

  const { series, current, low, high, first, last, start, end, domain, yTicks, xTicks, markers } = model;

  const flat = low === high;
  const atLow = !flat && current <= low;
  const aboveLow = low > 0 ? ((current - low) / low) * 100 : 0;
  const delta = current - first.price;
  const pct = first.price > 0 ? (delta / first.price) * 100 : 0;
  const changeTone = delta < 0 ? "good" : delta > 0 ? "bad" : "neutral"; // giá giảm = tốt cho người mua
  const ChangeIcon = delta < 0 ? TrendingDown : delta > 0 ? TrendingUp : Minus;

  const insight = flat
    ? { text: "Price has been stable", cls: "bg-slate-50 text-slate-600 border-slate-200" }
    : atLow
      ? { text: "Lowest price in this period", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" }
      : {
          text: `${aboveLow.toFixed(1)}% above the period low`,
          cls:
            aboveLow <= 5
              ? "bg-amber-50 text-amber-700 border-amber-100"
              : "bg-slate-50 text-slate-600 border-slate-200",
        };

  return shell(
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center text-sm font-bold rounded-full px-3 py-1 border ${insight.cls}`}>
          {insight.text}
        </span>
        {model.startedLate && (
          <span className="text-xs text-slate-500">
            Tracking since {shortDate(first.t)} — earlier prices aren’t available.
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard label="Current price" value={vnd(current)} hint={`Updated ${shortDate(last.t)}`} />
        <StatCard
          label="Lowest"
          tone="good"
          value={vnd(low)}
          hint={model.lowAt ? shortDate(model.lowAt) : undefined}
        />
        <StatCard
          label="Highest"
          tone="bad"
          value={vnd(high)}
          hint={model.highAt ? shortDate(model.highAt) : undefined}
        />
        <StatCard
          label={`Change · ${loadedDays}D`}
          tone={changeTone}
          icon={<ChangeIcon className="w-3.5 h-3.5" aria-hidden="true" />}
          value={delta === 0 ? "No change" : `${delta < 0 ? "−" : "+"}${vnd(Math.abs(delta))}`}
          hint={
            delta === 0
              ? `Since ${shortDate(first.t)}`
              : `${Math.abs(pct).toFixed(1)}% since ${shortDate(first.t)}`
          }
        />
      </div>

      <div
        role="img"
        aria-label={`Price chart for the last ${loadedDays} days. Current ${vnd(current)}, lowest ${vnd(low)}, highest ${vnd(high)}.`}
        className={`relative h-[300px] sm:h-[360px] w-full transition-opacity duration-200 ${
          refreshing ? "opacity-50" : "opacity-100"
        }`}
      >
        {refreshing && (
          <RefreshCw
            className="absolute top-2 right-2 z-10 w-4 h-4 text-orange-500 animate-spin"
            aria-hidden="true"
          />
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ORANGE} stopOpacity={0.25} />
                <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={[start, end]}
              ticks={xTicks}
              allowDataOverflow
              tickFormatter={shortDate}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              minTickGap={24}
              dy={8}
            />
            <YAxis
              domain={domain}
              ticks={yTicks}
              tickFormatter={compactVnd}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              width={52}
            />

            <Tooltip
              content={<ChartTooltip lowest={low} showLowest={!flat} />}
              cursor={{ stroke: ORANGE, strokeWidth: 1, strokeDasharray: "4 4" }}
            />

            {/* Đáy kỳ (không vẽ khi giá phẳng vì sẽ trùng với đường giá) */}
            {!flat && (
              <ReferenceLine
                y={low}
                stroke={GREEN}
                strokeDasharray="5 5"
                strokeOpacity={0.7}
                label={{
                  value: "Lowest",
                  position: "insideBottomRight",
                  fill: GREEN,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
            )}

            {/* Giá đổi theo bậc nên dùng stepAfter: không "nội suy" ra mức giá chưa từng tồn tại */}
            <Area
              type="stepAfter"
              dataKey="price"
              stroke={ORANGE}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 6, fill: ORANGE, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={!reducedMotion}
            />

            {/* Chấm cho từng lần ghi nhận giá thật (không vẽ cho điểm "now" giả) */}
            {markers.map((p) => (
              <ReferenceDot
                key={p.t}
                x={p.t}
                y={p.price}
                r={4}
                fill={ORANGE}
                stroke="#fff"
                strokeWidth={2}
                ifOverflow="hidden"
              />
            ))}

            {!flat && model.lowAt && (
              <ReferenceDot
                x={model.lowAt}
                y={low}
                r={6}
                fill={GREEN}
                stroke="#fff"
                strokeWidth={2}
                ifOverflow="hidden"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {model.raw.length === 1 && (
        <p className="mt-4 text-sm text-slate-500 text-center">
          Only one price has been recorded so far — the chart fills in as the price changes.
        </p>
      )}
    </>,
    refreshing,
  );
}

/* =====================================================================
 *  VIDEO REVIEWS — helpers & component
 * ===================================================================== */
// Tiêu đề từ YouTube có thể chứa "&amp;", "&#39;" — React sẽ in nguyên chữ nếu không giải mã
const decodeEntities = (s = "") =>
  new DOMParser().parseFromString(s, "text/html").documentElement.textContent ?? s;

const withAutoplay = (url) => `${url}${url.includes("?") ? "&" : "?"}autoplay=1&rel=0`;

function normalizeVideos(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((v) => ({
      id: v.videoId,
      title: decodeEntities(v.title || "Untitled video"),
      thumb: v.thumbnailUrl || (v.videoId ? `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg` : null),
      embedUrl: v.embedUrl || (v.videoId ? `https://www.youtube.com/embed/${v.videoId}` : null),
      watchUrl: v.videoId ? `https://www.youtube.com/watch?v=${v.videoId}` : v.embedUrl || null,
    }))
    .filter((v) => v.embedUrl);
}

function VideoReviewsSection({ videos, loading, error, productName, onRetry }) {
  const items = useMemo(() => normalizeVideos(videos), [videos]);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setActive(0);
    setPlaying(false);
  }, [videos]);

  const current = items[active];
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${productName ?? ""} review`.trim(),
  )}`;

  const select = (index) => {
    setActive(index);
    setPlaying(true); // chọn video trong danh sách = muốn xem ngay
  };

  return (
    <section
      id="video-reviews"
      className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
            <Play className="w-5 h-5 text-rose-600" fill="currentColor" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-questrial leading-tight">
              Video Reviews
              {!loading && !error && items.length > 0 && (
                <span className="ml-2 align-middle text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-2 py-0.5">
                  {items.length}
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-500">Top YouTube reviews for this product</p>
          </div>
        </div>

        {productName && (
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-rose-600 transition-colors self-start sm:self-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded"
          >
            More on YouTube <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        )}
      </div>

      {loading ? (
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse"
          aria-busy="true"
          aria-label="Loading video reviews"
        >
          <div className="lg:col-span-8 space-y-3">
            <div className="aspect-video bg-slate-100 rounded-2xl" />
            <div className="h-5 bg-slate-100 rounded w-3/4" />
          </div>
          <div className="lg:col-span-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-36 aspect-video bg-slate-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-slate-100 rounded" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl text-center py-12 px-4">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-red-600 border border-red-200 rounded-xl font-semibold hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" /> Try again
          </button>
        </div>
      ) : current ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={items.length > 1 ? "lg:col-span-8" : "lg:col-span-12"}>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-100 shadow-sm">
              {playing ? (
                <iframe
                  key={current.id || current.embedUrl}
                  src={withAutoplay(current.embedUrl)}
                  title={current.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                // Chỉ nạp iframe khi bấm play: trang nhẹ và nhanh hơn nhiều so với nhúng sẵn nhiều video
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label={`Play video: ${current.title}`}
                  className="group absolute inset-0 w-full h-full focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-400/60"
                >
                  {current.thumb && (
                    <img
                      src={current.thumb}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition duration-300"
                    />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-rose-500 transition duration-200">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1" fill="currentColor" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              )}
            </div>

            <div className="mt-4 flex items-start justify-between gap-4">
              <h3
                className="min-w-0 font-bold text-slate-900 font-questrial text-lg leading-snug line-clamp-2"
                title={current.title}
              >
                {current.title}
              </h3>
              {current.watchUrl && (
                <a
                  href={current.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-rose-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded"
                >
                  YouTube <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {items.length > 1 && (
            <ul className="lg:col-span-4 space-y-2" aria-label="More video reviews">
              {items.map((v, i) => {
                const isActive = i === active;
                return (
                  <li key={v.id || v.embedUrl}>
                    <button
                      type="button"
                      onClick={() => select(i)}
                      aria-current={isActive ? "true" : undefined}
                      aria-label={`${isActive ? "Selected: " : "Play: "}${v.title}`}
                      className={`group w-full flex gap-3 p-2 rounded-2xl text-left border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
                        isActive
                          ? "bg-rose-50/60 border-rose-200"
                          : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <span className="relative w-36 shrink-0 aspect-video rounded-xl overflow-hidden bg-slate-200">
                        {v.thumb && (
                          <img src={v.thumb} alt="" loading="lazy" className="w-full h-full object-cover" />
                        )}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors">
                          <Play
                            className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
                            fill="currentColor"
                            aria-hidden="true"
                          />
                        </span>
                      </span>
                      <span className="min-w-0 flex-1 py-0.5">
                        <span
                          className={`block text-sm font-semibold leading-snug line-clamp-3 ${
                            isActive ? "text-rose-700" : "text-slate-800 group-hover:text-rose-600"
                          }`}
                        >
                          {v.title}
                        </span>
                        {isActive && (
                          <span className="mt-1 inline-block text-[11px] font-bold text-rose-600 uppercase tracking-wide">
                            {playing ? "Now playing" : "Selected"}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl text-center py-14 px-4 border border-slate-100 border-dashed">
          <Play className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-slate-700 font-semibold mb-1">No video reviews found for this product</p>
          <p className="text-slate-500 text-sm mb-5">We couldn’t find a review that matches it yet.</p>
          {productName && (
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Search className="w-4 h-4" aria-hidden="true" /> Search on YouTube
            </a>
          )}
        </div>
      )}
    </section>
  );
}

/* =====================================================================
 *  PAGE
 * ===================================================================== */
export default function Detail() {
  const { id } = useParams();

  // Main Product States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Price History States
  const [priceHistory, setPriceHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyDays, setHistoryDays] = useState(30);
  const [loadedDays, setLoadedDays] = useState(30); // khoảng ngày của dữ liệu đang hiển thị
  const [errorHistory, setErrorHistory] = useState(null);
  const [historyReload, setHistoryReload] = useState(0);

  // Suggestions States
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [errorSuggestions, setErrorSuggestions] = useState(null);

  // Video Reviews States
  const [videoReviews, setVideoReviews] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [errorVideos, setErrorVideos] = useState(null);
  const [videosReload, setVideosReload] = useState(0);

  // State quản lý loading của đúng item đang bấm Track
  const [trackingId, setTrackingId] = useState(null);

  // Instant scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // Fetch Product Data & Suggestions
  useEffect(() => {
    if (!id) return;

    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        setProduct(await getProduct(id));
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Cannot load product information. Please try again!");
      } finally {
        setLoading(false);
      }
    };

    const fetchSuggestions = async () => {
      try {
        setLoadingSuggestions(true);
        setErrorSuggestions(null);
        setSuggestions(await getSuggestions(id));
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setErrorSuggestions("Cannot load recommended products.");
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchProductDetail();
    fetchSuggestions();
  }, [id]);

  // Fetch Price History
  useEffect(() => {
    if (!id) return;
    let ignore = false; // bỏ response cũ khi đổi khoảng ngày / đổi sản phẩm liên tục

    // Sang sản phẩm khác thì bỏ dữ liệu của sản phẩm trước; đổi khoảng ngày thì giữ lại để không giật layout
    setPriceHistory((prev) =>
      prev && String(prev.productId).toLowerCase() === String(id).toLowerCase() ? prev : null,
    );

    const fetchPriceHistory = async () => {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        setLoadingHistory(true);
        setErrorHistory(null);
        // Endpoint của backend là /api/products/... (số nhiều)
        const response = await axios.get(
          `${getBaseUrl()}/api/products/${id}/price-history`,
          {
            params: { days: historyDays },
            headers: headers,
          },
        );
        if (ignore) return;
        setPriceHistory(response.data);
        setLoadedDays(historyDays);
      } catch (err) {
        if (ignore) return;
        console.error("Error fetching price history:", err);
        setErrorHistory("Couldn’t load the price history.");
      } finally {
        if (!ignore) setLoadingHistory(false);
      }
    };

    fetchPriceHistory();
    return () => {
      ignore = true;
    };
  }, [id, historyDays, historyReload]);

  // Fetch Video Reviews
  useEffect(() => {
    if (!id) return;
    let ignore = false;

    const fetchVideoReviews = async () => {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        setLoadingVideos(true);
        setErrorVideos(null);
        const response = await axios.get(
          `${getBaseUrl()}/api/product/${id}/reviews`,
          { headers }
        );
        if (ignore) return;
        setVideoReviews(response.data);
      } catch (err) {
        if (ignore) return;
        console.error("Error fetching video reviews:", err);
        setErrorVideos("Couldn’t load video reviews.");
      } finally {
        if (!ignore) setLoadingVideos(false);
      }
    };

    fetchVideoReviews();
    return () => {
      ignore = true;
    };
  }, [id, videosReload]);

  // Giá 0 = sàn chưa có giá (sản phẩm ngừng bán / hết hàng lúc thêm)
  const formatPrice = (price) =>
    price > 0 ? `${price.toLocaleString("vi-VN")} ₫` : "No price yet";

  // Format Date Helper
  const formatDateTime = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Làm mới danh sách gợi ý
  const handleRefreshBtn = async () => {
    if (!id || loadingSuggestions) return;

    try {
      setLoadingSuggestions(true);
      setErrorSuggestions(null);

      setSuggestions(await refreshSuggestions(id));
    } catch (err) {
      console.error("Error refreshing suggestions:", err);
      setErrorSuggestions(
        "Failed to refresh suggestions. Please try again later.",
      );
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Xử lý khi bấm nút Track
  const handleTrackProduct = async (suggestion, itemIdentifier) => {
    if (!suggestion.productLink) {
      toast.error("Cannot track this product: Missing product link.", {
        position: "top-right",
      });
      return;
    }

    setTrackingId(itemIdentifier);
    const toastId = toast.loading("Adding Product...", {
      position: "top-right",
    });

    try {
      await addProduct(suggestion.productLink);

      toast.success("Added Successfully!", {
        id: toastId,
        position: "top-right",
      });
    } catch (err) {
      console.error("Error tracking product:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to track this product. Please try again.";

      toast.error(errorMsg, {
        id: toastId,
        position: "top-right",
      });
    } finally {
      setTrackingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 font-syne selection:bg-orange-100 selection:text-orange-900">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-6xl mx-auto space-y-8" id="detail">
        {/* Navigation / Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Link
            to="/products"
            className="hover:text-orange-600 transition-colors"
          >
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-900">Product Detail</span>
        </div>

        {/* 1. MAIN PRODUCT SECTION */}
        {loading ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 animate-pulse">
            <div className="w-40 h-8 bg-slate-100 rounded-full mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="aspect-square bg-slate-100 rounded-2xl w-full"></div>
              <div className="space-y-6 pt-4">
                <div className="space-y-3">
                  <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
                  <div className="h-10 bg-slate-100 rounded-lg w-3/4"></div>
                </div>
                <div className="h-32 bg-slate-100 rounded-2xl w-full mt-8"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 rounded-3xl p-10 text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : !product ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-2xl text-slate-700 font-bold mb-2">
              Product not found!
            </p>
            <p className="text-slate-500">
              The product you're looking for doesn't exist or has been removed.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 lg:p-12">
              <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-full w-max border border-emerald-200/60">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Product Detail
                    </span>
                    <PlatformBadge platform={getPlatformFromUrl(product.productLink)} />
                    <StockBadge isInStock={product.isInStock} outOfStockSince={product.outOfStockSince} />
                  </div>
                  <h1 className="font-questrial text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-slate-900 break-words">
                    {product.productName}
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                <div className="lg:col-span-5 relative w-full aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-6 group">
                  <img
                    src={product.imageURL || "https://via.placeholder.com/400"}
                    alt={product.productName || "Product"}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>

                <div className="lg:col-span-7 flex flex-col h-full min-w-0">
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50/30 border border-orange-100/80 rounded-2xl p-6 md:p-8 mb-8 shadow-[inset_0_1px_4px_rgba(255,255,255,0.5)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-orange-200/50">
                      <div className="min-w-0">
                        <span className="text-[11px] text-gray-800 uppercase font-bold tracking-wider mb-1.5 block">
                          Tracked Price
                        </span>
                        <span
                          title={`${product.initialPrice} ₫`}
                          className="text-2xl text-slate-400 font-bold font-questrial block truncate"
                        >
                          {formatPrice(product.initialPrice)}
                        </span>
                      </div>

                      {/* "> 0" thay vì "&&": giá 0 (sàn chưa có giá) không còn in ra số "0" lạc chỗ */}
                      {product.latestPrice > 0 && (
                        <div className="min-w-0 sm:text-right">
                          <span className="text-[11px] text-orange-600 uppercase font-bold tracking-wider mb-1.5 block">
                            {product.isInStock === false ? "Last Known Price" : "Current Market Price"}
                          </span>
                          <span
                            title={`${product.latestPrice} ₫`}
                            className="text-4xl text-orange-600 font-black font-questrial leading-none block truncate tracking-tight drop-shadow-sm"
                          >
                            {product.latestPrice?.toLocaleString("vi-VN")} ₫
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-medium">
                      <div className="flex items-center gap-2 text-slate-500 font-urbanist font-bold text-lg">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Last updated:{" "}
                        <span className="text-slate-700 font-urbanist font-medium">
                          {formatDateTime(
                            product.lastUpdatedAt || product.updatedAt,
                          )}
                        </span>
                      </div>

                      {product.productLink && (
                        <a
                          href={product.productLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] transition-all duration-200"
                        >
                          Visit Store
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2.5 PRICE HISTORY SECTION */}
            <PriceHistorySection
              data={priceHistory}
              loading={loadingHistory}
              error={errorHistory}
              days={historyDays}
              loadedDays={loadedDays}
              onChangeDays={setHistoryDays}
              onRetry={() => setHistoryReload((k) => k + 1)}
            />

            {/* 2. DESCRIPTION SECTION */}
            <div
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 mt-8"
              id="description"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 font-questrial">
                  Product Description
                </h2>
              </div>

              {product.description &&
              typeof product.description === "string" ? (
                <div
                  className="prose prose-slate prose-lg max-w-none text-slate-600 font-ggf leading-relaxed marker:text-orange-500"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <div className="bg-slate-50 rounded-2xl text-center py-12 border border-slate-100 border-dashed">
                  <svg
                    className="w-12 h-12 text-slate-300 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-slate-500 font-medium">
                    No detailed description available for this product.
                  </p>
                </div>
              )}
            </div>

            {/* 2.5 VIDEO REVIEWS SECTION */}
            <VideoReviewsSection
              videos={videoReviews}
              loading={loadingVideos}
              error={errorVideos}
              productName={product.productName}
              onRetry={() => setVideosReload((k) => k + 1)}
            />
          </>
        )}

        {/* 3. SUGGESTIONS SECTION */}
        <div className="pt-4" id="suggestion">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="inline-block py-1 bg-gray-100 text-gray-600 text-xl font-bold uppercase tracking-widest rounded-full w-max mb-4">
                Suggestion Deals
              </span>
              <p className="text-slate-500 text-lg font-syne">
                Similar products with better pricing options.
              </p>
            </div>

            <button
              onClick={handleRefreshBtn}
              disabled={loadingSuggestions}
              className="group mt-4 inline-flex font-questrial text-lg cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 active:scale-95 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 self-start sm:self-auto"
            >
              <RefreshCw
                className={`w-6 h-6 text-gray-400 group-hover:text-amber-600 transition-transform duration-500 ${
                  loadingSuggestions
                    ? "animate-spin text-amber-600"
                    : "group-hover:rotate-180"
                }`}
              />
              <span>
                {loadingSuggestions
                  ? "Refreshing..."
                  : " Refresh Suggestions Now "}
              </span>
            </button>
          </div>

          {loadingSuggestions ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm animate-pulse"
                >
                  <div className="w-full h-48 bg-slate-100 rounded-2xl mb-5"></div>
                  <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3 mb-6"></div>
                  <div className="h-8 bg-slate-100 rounded w-1/2 mb-4"></div>
                  <div className="h-11 bg-slate-100 rounded-xl w-full"></div>
                </div>
              ))}
            </div>
          ) : errorSuggestions ? (
            <div className="bg-red-50 p-8 rounded-3xl font-questrial text-xl border border-red-100 text-center text-red-500 font-medium">
              {errorSuggestions}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="bg-white py-16 px-4 rounded-3xl shadow-sm border border-slate-100 border-dashed text-center">
              <span className="text-5xl mb-4 block">🏷️</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-questrial">
                No cheaper similar products found
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                We couldn't find a similar product at a lower price on the
                other supported platforms right now. Prices change often – try
                refreshing later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {suggestions.map((item, index) => {
                const itemKey = item.id || item.productLink || index;
                const isItemTracking = trackingId === itemKey;

                return (
                  <div
                    key={itemKey}
                    className="group relative bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full overflow-hidden"
                  >
                    {item.savingsAmount > 0 && (
                      <div className="absolute top-4 left-4 bg-rose-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full z-10 shadow-sm border border-rose-400">
                        Save {item.savingsAmount?.toLocaleString("vi-VN")} ₫
                      </div>
                    )}

                    <div className="relative aspect-[4/3] w-full bg-slate-50 rounded-2xl mb-5 p-4 overflow-hidden">
                      {/* Gợi ý có thể đến từ sàn khác với sản phẩm gốc */}
                      <PlatformBadge
                        platform={item.platform || getPlatformFromUrl(item.productLink)}
                        className="absolute top-3 right-3 z-10"
                      />
                      <img
                        src={item.imageURL || "https://via.placeholder.com/200"}
                        alt={item.productName || "Product"}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    </div>

                    <h3
                      title={item.productName}
                      className="font-bold font-questrial text-slate-800 text-base mb-3 line-clamp-2 leading-snug flex-grow group-hover:text-orange-600 transition-colors break-words"
                    >
                      {item.productName}
                    </h3>

                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <p
                        title={`${item.price} ₫`}
                        className="text-orange-600 font-questrial font-black text-2xl mb-4 truncate"
                      >
                        {item.price?.toLocaleString("vi-VN")} ₫
                      </p>
                      <div className="mb-4">
                        <p className="text-sm font-questrial font-bold text-slate-800">
                          Last updated at -
                        </p>
                        <p className="text-sm font-extrabold font-urbanist text-slate-600">
                          {formatDateTime(item.lastUpdatedAt)}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-6">
                        <button
                          onClick={() => handleTrackProduct(item, itemKey)}
                          disabled={isItemTracking}
                          className="group relative flex-1 inline-flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl font-urbanist font-semibold text-xs tracking-wider uppercase text-slate-100 bg-slate-900 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/50 shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_4px_20px_-2px_rgba(245,158,11,0.25)] active:scale-[0.98] transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                          {isItemTracking ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                              <span className="text-slate-300 lowercase text-xs font-medium">
                                TRACKING
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                              </span>
                              <span className="group-hover:text-amber-300 transition-colors duration-200">
                                Track
                              </span>
                            </>
                          )}
                        </button>

                        {item.productLink ? (
                          <a
                            href={item.productLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center bg-slate-100 text-slate-800 py-3 rounded-xl font-bold text-sm hover:bg-slate-900 hover:text-white active:scale-[0.98] transition-all duration-200"
                          >
                            View
                            <svg
                              className="w-4 h-4 ml-1.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex-1 bg-slate-50 text-slate-400 py-3 rounded-xl font-bold text-sm cursor-not-allowed border border-slate-100"
                          >
                            N/A
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}