// Định dạng số liệu cho các tab trang Admin

export const formatNumber = (value) => (value ?? 0).toLocaleString("vi-VN");

export const formatPrice = (value) => (value == null ? "—" : `${Number(value).toLocaleString("vi-VN")} ₫`);

export const formatPercent = (part, total) => (total > 0 ? `${Math.round((part / total) * 1000) / 10}%` : "—");

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : "—";

/** "3 phút trước" – dùng cho lần chạy / lần thành công gần nhất. */
export function formatAgo(value) {
  if (!value) return "—";
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 0) return `in ${formatDuration(-seconds * 1000)}`;
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatDuration(ms) {
  if (ms == null) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}
