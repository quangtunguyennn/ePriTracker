import { useTranslation } from "react-i18next";
import { getLocale } from "../i18n";

// Nhãn "No longer available": sàn đã gỡ sản phẩm, hệ thống ngưng cập nhật giá (giá hiển thị là giá cuối cùng)
const formatDate = (date) =>
  new Date(date).toLocaleDateString(getLocale(), { month: "short", day: "numeric", year: "numeric" });

/**
 * @param compact Thẻ nhỏ (danh sách sản phẩm): chỉ hiện chữ, ngày gỡ nằm trong tooltip.
 */
export default function DelistedBadge({ isDelisted, delistedAt, compact = false, className = "" }) {
  const { t } = useTranslation();
  if (!isDelisted) return null;

  const since = delistedAt ? " " + t("since {{date}}", { date: formatDate(delistedAt) }) : "";

  return (
    <span
      title={`${t("Removed from the platform")}${since} – ${t("price tracking has stopped")}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-600/90 backdrop-blur-md text-[12px] font-medium font-syne text-white shadow-sm whitespace-nowrap ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
      {t("No longer available")}{compact ? "" : since}
    </span>
  );
}
