import { useCallback, useEffect, useRef, useState } from "react";
import {
  NOTIFICATIONS_CHANGED,
  createNotificationConnection,
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notificationApi";

const PAGE_SIZE = 20;

/**
 * Trạng thái chuông thông báo: số chưa đọc luôn cập nhật (SignalR đẩy tín hiệu → gọi API đếm lại),
 * danh sách chỉ tải khi mở chuông. Mất kết nối → SignalR tự nối lại; nối lại / quay lại tab → đồng bộ lại.
 */
export default function useNotifications({ enabled, isOpen }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const refreshCount = useCallback(async () => {
    try {
      setUnreadCount(await getUnreadCount());
    } catch {
      // mạng lỗi: giữ số cũ, lần tín hiệu / quay lại tab sau sẽ thử lại
    }
  }, []);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      const page = await getNotifications({ take: PAGE_SIZE });
      setItems(page.items);
      setHasMore(page.hasMore);
      setUnreadCount(page.unreadCount);
      setLoadedOnce(true);
    } catch {
      // giữ danh sách cũ
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!items.length) return;
    setLoading(true);
    try {
      const page = await getNotifications({ take: PAGE_SIZE, before: items[items.length - 1].createdAt });
      setItems((prev) => [...prev, ...page.items.filter((n) => !prev.some((p) => p.notificationId === n.notificationId))]);
      setHasMore(page.hasMore);
    } finally {
      setLoading(false);
    }
  }, [items]);

  // Kết nối realtime khi đã đăng nhập
  useEffect(() => {
    if (!enabled) return undefined;
    refreshCount();

    const connection = createNotificationConnection();
    const onChanged = () => {
      refreshCount();
      if (isOpenRef.current) loadFirstPage();
    };
    connection.on(NOTIFICATIONS_CHANGED, onChanged);
    connection.onreconnected(onChanged);
    connection.start().catch(() => {
      // không nối được (server tắt…): chuông vẫn dùng được, số chưa đọc cập nhật khi mở chuông / quay lại tab
    });

    const onVisible = () => {
      if (document.visibilityState === "visible") onChanged();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      connection.off(NOTIFICATIONS_CHANGED, onChanged);
      connection.stop();
    };
  }, [enabled, refreshCount, loadFirstPage]);

  // Mở chuông → tải danh sách mới nhất
  useEffect(() => {
    if (enabled && isOpen) loadFirstPage();
  }, [enabled, isOpen, loadFirstPage]);

  const markRead = useCallback(async (id) => {
    let wasUnread = false;
    setItems((prev) => prev.map((n) => {
      if (n.notificationId !== id) return n;
      wasUnread = !n.isRead;
      return { ...n, isRead: true };
    }));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markNotificationRead(id);
    } catch {
      refreshCount();
    }
  }, [refreshCount]);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      refreshCount();
    }
  }, [refreshCount]);

  return { unreadCount, items, hasMore, loading, loadedOnce, loadMore, markRead, markAllRead };
}
