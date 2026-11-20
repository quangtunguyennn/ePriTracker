// Thành phần giao diện dùng chung cho các tab trang Admin (nền tối, kính mờ như trang Admin cũ)

export const PANEL = "bg-[#0f172a]/85 rounded-2xl border border-slate-700/50 shadow-xl";

export function Panel({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`${PANEL} p-6 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            {title && <h3 className="text-xl font-urbanist font-bold text-white">{title}</h3>}
            {subtitle && <p className="text-sm font-syne text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint, tone = "default" }) {
  const tones = {
    default: "text-white",
    good: "text-emerald-400",
    warn: "text-amber-400",
    bad: "text-rose-400",
  };
  return (
    <div className={`${PANEL} p-5`}>
      <p className="text-xs font-syne uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-urbanist font-bold ${tones[tone] ?? tones.default}`}>{value}</p>
      {hint && <p className="mt-1 text-xs font-syne text-slate-500">{hint}</p>}
    </div>
  );
}

export function Pill({ children, tone = "default", title }) {
  const tones = {
    default: "bg-slate-800/80 border-slate-600 text-slate-300",
    good: "bg-emerald-900/40 border-emerald-800 text-emerald-400",
    warn: "bg-amber-900/40 border-amber-800 text-amber-400",
    bad: "bg-rose-900/40 border-rose-800 text-rose-400",
    info: "bg-cyan-900/40 border-cyan-800 text-cyan-400",
  };
  return (
    <span title={title} className={`inline-block px-2.5 py-1 border rounded-lg text-[11px] font-bold tracking-wide ${tones[tone] ?? tones.default}`}>
      {children}
    </span>
  );
}

export function LoadingRow({ text = "Loading..." }) {
  return <p className="text-sm font-syne text-slate-400 py-6 text-center">{text}</p>;
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className={`${PANEL} p-6 text-center`}>
      <p className="text-rose-400 font-syne">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 px-5 py-2 rounded-lg border border-slate-600 text-slate-300 text-xs font-bold hover:bg-slate-800">
          RETRY
        </button>
      )}
    </div>
  );
}
