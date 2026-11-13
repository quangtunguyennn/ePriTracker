// Nhãn tên sàn TMĐT (Tiki, CellphoneS...) – không hiện gì nếu không biết sàn
const STYLES = {
  Tiki: "bg-sky-50 text-sky-700 border-sky-200",
  CellphoneS: "bg-rose-50 text-rose-700 border-rose-200",
  HACOM: "bg-blue-50 text-blue-700 border-blue-200",
  GearVN: "bg-red-50 text-red-700 border-red-200",
};

export default function PlatformBadge({ platform, className = "" }) {
  if (!platform) return null;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold font-syne tracking-wide ${
        STYLES[platform] ?? "bg-slate-50 text-slate-700 border-slate-200"
      } ${className}`}
    >
      {platform}
    </span>
  );
}
