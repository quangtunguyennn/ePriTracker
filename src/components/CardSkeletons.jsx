// Khung xương khi đang tải – đúng hình thẻ thật để trang không nhảy bố cục khi dữ liệu về (.skeleton trong index.css)

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col w-full bg-white rounded-2xl border border-slate-200/80 overflow-hidden" aria-hidden="true">
      <div className="skeleton aspect-square w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-4 w-3/5" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="skeleton h-10" />
          <div className="skeleton h-10" />
        </div>
        <div className="skeleton h-9 w-full" />
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col" aria-hidden="true">
      <div className="skeleton h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-4 w-2/5" />
        <div className="flex gap-3 pt-3">
          <div className="skeleton h-10 flex-1" />
          <div className="skeleton h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}

/** Lưới khung xương + chữ ẩn cho trình đọc màn hình. */
export function SkeletonGrid({ count, className, label, Card }) {
  return (
    <div className={className} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, i) => <Card key={i} />)}
    </div>
  );
}
