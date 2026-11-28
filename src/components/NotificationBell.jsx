import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, PackageX, TrendingDown } from "lucide-react";
import useNotifications from "../hooks/useNotifications";
import { useTranslation } from "react-i18next";
import { formatNotification, formatRelativeTime, notificationUi } from "../i18n/notifications";

// Biểu tượng theo loại thông báo (khoá trùng NotificationTypes ở backend)
const TYPE_STYLES = {
  TargetReached: { Icon: TrendingDown, box: "bg-emerald-50 text-emerald-700" },
  Delisted: { Icon: PackageX, box: "bg-slate-100 text-slate-600" },
};
const DEFAULT_STYLE = { Icon: Bell, box: "bg-orange-50 text-orange-600" };

/** Chuông thông báo trên Navbar: số chưa đọc (realtime qua SignalR) + danh sách thả xuống. */
export default function NotificationBell({ enabled = true }) {
  const [open, setOpen] = useState(false);
  const [untrackedId, setUntrackedId] = useState(null);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  useTranslation(); // vẽ lại khi đổi ngôn ngữ (chữ và câu thông báo lấy theo ngôn ngữ đang dùng)
  const ui = notificationUi();
  const { unreadCount, items, hasMore, loading, loadedOnce, loadMore, markRead, markAllRead } = useNotifications({ enabled, isOpen: open });

  // Đóng khi bấm ra ngoài hoặc nhấn Esc
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!enabled) return null;

  const handleClick = (n) => {
    markRead(n.notificationId);
    if (n.productId && n.productTracked) {
      setOpen(false);
      navigate(`/product/${n.productId}`);
    } else {
      setUntrackedId(n.notificationId); // sản phẩm đã bỏ theo dõi → báo nhẹ thay vì mở trang lỗi
    }
  };

  const badge = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `${ui.open}, ${unreadCount} ${ui.unread}` : ui.open}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
      >
        <Bell size={22} aria-hidden="true" />
        {unreadCount > 0 && (
          <span key={badge} className="anim-pop absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-[11px] font-semibold leading-5 text-center ring-2 ring-white">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          role="region"
          aria-label={ui.title}
          className="anim-pop absolute right-0 top-12 z-50 w-[22rem] sm:w-96 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">
              {ui.title}
              {unreadCount > 0 && <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">{unreadCount}</span>}
            </p>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4 cursor-pointer">
                {ui.markAll}
              </button>
            )}
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {!loadedOnce && loading ? (
              <ul aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="flex gap-3 px-4 py-3">
                    <div className="skeleton h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3.5 w-2/3" />
                      <div className="skeleton h-3 w-full" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : items.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Bell size={28} className="mx-auto text-slate-300" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-slate-900">{ui.empty}</p>
                <p className="mt-1 text-xs text-slate-500">{ui.emptyHint}</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((n) => {
                  const { title, body } = formatNotification(n);
                  const { Icon, box } = TYPE_STYLES[n.type] ?? DEFAULT_STYLE;
                  return (
                    <li key={n.notificationId}>
                      <button
                        type="button"
                        onClick={() => handleClick(n)}
                        className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 cursor-pointer ${n.isRead ? "" : "bg-orange-50/40"}`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${box}`}>
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-sm ${n.isRead ? "text-slate-700" : "font-semibold text-slate-900"}`}>{title}</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-slate-600 line-clamp-2">{body}</span>
                          <span className="mt-1 block text-[11px] text-slate-500">{formatRelativeTime(n.createdAt)}</span>
                          {untrackedId === n.notificationId && (
                            <span className="mt-1 block text-[11px] font-medium text-amber-800">{ui.untracked}</span>
                          )}
                        </span>
                        {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {hasMore && (
            <button type="button" onClick={loadMore} disabled={loading}
              className="w-full border-t border-slate-100 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60 cursor-pointer">
              {ui.loadMore}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
