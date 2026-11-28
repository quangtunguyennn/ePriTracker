import { useTranslation } from 'react-i18next';

// Thành phần giao diện dùng chung cho các tab trang Admin – kiểu SaaS sáng: thẻ trắng, viền mảnh, chữ xám đậm/nhạt

export const PANEL = "bg-white rounded-xl border border-slate-200";

export function Panel({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`${PANEL} p-6 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

// Màu trạng thái chỉ cho số liệu mang nghĩa tốt/xấu; luôn kèm chữ ở dòng gợi ý để không dựa vào màu
export function StatCard({ label, value, hint, tone = "default" }) {
  const tones = {
    default: "text-slate-900",
    good: "text-emerald-700",
    warn: "text-amber-700",
    bad: "text-rose-700",
  };
  return (
    <div className={`${PANEL} p-5`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-[28px] leading-none font-semibold ${tones[tone] ?? tones.default}`}>{value}</p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// Nhãn trạng thái: chấm màu + chữ (không để màu đứng một mình)
export function Pill({ children, tone = "default", title }) {
  const tones = {
    default: { box: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
    good: { box: "bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
    warn: { box: "bg-amber-50 text-amber-800", dot: "bg-amber-500" },
    bad: { box: "bg-rose-50 text-rose-800", dot: "bg-rose-500" },
    info: { box: "bg-sky-50 text-sky-800", dot: "bg-sky-500" },
  };
  const t = tones[tone] ?? tones.default;
  return (
    <span title={title} className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${t.box}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden="true" />
      {children}
    </span>
  );
}

export function LoadingRow({ text }) {
  const { t } = useTranslation();
  return <p className="text-sm text-slate-500 py-6 text-center">{text ?? t("Loading…")}</p>;
}

export function ErrorBox({ message, onRetry }) {
  const { t } = useTranslation();
  return (
    <div className={`${PANEL} p-8 text-center`}>
      <p className="text-sm text-rose-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">
          {t("Try again")}
        </button>
      )}
    </div>
  );
}

// Nút phụ dùng chung (viền xám, nền trắng)
export const SECONDARY_BUTTON = "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60";
