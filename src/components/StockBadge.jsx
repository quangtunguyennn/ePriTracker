// Nhãn "Out of stock": sản phẩm vẫn được theo dõi, giá hiển thị là giá gần nhất trước khi hết hàng
const formatSince = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/**
 * @param compact Thẻ nhỏ (danh sách sản phẩm): chỉ hiện "Out of stock", ngày hết hàng nằm trong tooltip.
 */
export default function StockBadge({ isInStock, outOfStockSince, compact = false, className = "" }) {
  if (isInStock !== false) return null;

  const since = outOfStockSince ? ` since ${formatSince(outOfStockSince)}` : "";

  return (
    <span
      title={`Out of stock${since} – still tracking, price updates automatically when it is back in stock`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-[12px] font-medium font-syne text-white shadow-sm whitespace-nowrap ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white" />
      Out of stock{compact ? "" : since}
    </span>
  );
}
