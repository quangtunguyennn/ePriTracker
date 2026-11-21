import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import api, { API_BASE_URL } from "./client";
import { getToken } from "./authStorage";

// ===== Chuông thông báo (chỉ thông báo của người đang đăng nhập) =====

/** { items, unreadCount, hasMore } – before: createdAt của dòng cuối để tải trang tiếp theo. */
export const getNotifications = ({ take = 20, before } = {}) =>
  api
    .get("/api/notifications", { params: { take, before } })
    .then((res) => res.data);

export const getUnreadCount = () =>
  api.get("/api/notifications/unread-count").then((res) => res.data.count);

export const markNotificationRead = (id) =>
  api.put(`/api/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.put("/api/notifications/read-all");

/**
 * Kết nối SignalR: server chỉ gửi tín hiệu "notificationsChanged" (không kèm nội dung) → bên dùng tự gọi API tải lại.
 * JWT gửi qua query "access_token" (WebSocket không đặt được header). withCredentials: false vì backend dùng CORS "AllowAll".
 */
export const createNotificationConnection = () =>
  new HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/notifications`, {
      accessTokenFactory: () => getToken() ?? "",
      withCredentials: false,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build();

export const NOTIFICATIONS_CHANGED = "notificationsChanged";
