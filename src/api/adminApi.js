import api from "./client";

// ===== Trang Admin (chỉ tài khoản Admin) =====

/** Thống kê sử dụng: người dùng, sản phẩm, thông báo, top sản phẩm. */
export const getAdminStats = () =>
  api.get("/api/admin/stats").then((res) => res.data);

/** Giám sát cào: số liệu theo sàn, job Hangfire, sức khoẻ dữ liệu, lỗi gần đây. */
export const getAdminMonitoring = () =>
  api.get("/api/admin/monitoring").then((res) => res.data);

/** Sự kiện của các sàn tự đăng (CellphoneS, HACOM, GearVN) + kết quả đồng bộ gần nhất. */
export const getAutoEvents = () =>
  api.get("/api/admin/events/auto").then((res) => res.data);

/** Đồng bộ ngay sự kiện của một sàn (có thể mất vài giây đến vài chục giây). */
export const syncAutoEvents = (platform) =>
  api
    .post(`/api/admin/events/auto/${encodeURIComponent(platform)}/sync`)
    .then((res) => res.data);

/** Ẩn (hidden = true) / hiện lại một sự kiện tự đăng. */
export const setAutoEventHidden = (eventId, hidden) =>
  api
    .put(`/api/admin/events/auto/${eventId}/hidden`, { hidden })
    .then((res) => res.data);
