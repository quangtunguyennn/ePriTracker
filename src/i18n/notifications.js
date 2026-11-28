// Dựng câu thông báo theo ngôn ngữ từ dữ liệu (type + data) do backend lưu – thông báo cũ cũng tự đổi ngôn ngữ.
// Thêm ngôn ngữ: thêm một khối vào MESSAGES. Thêm loại thông báo: thêm khoá trùng với NotificationTypes ở backend.

import { DEFAULT_LANGUAGE, getLanguage } from "./index";

const LOCALES = { en: "en-US", vi: "vi-VN" };

const formatPrice = (value, lang) =>
  value == null ? null : `${Number(value).toLocaleString(LOCALES[lang] ?? LOCALES.en)} ₫`;

const MESSAGES = {
  en: {
    TargetReached: ({ productName, price, targetPrice }, lang) => ({
      title: "Price target reached",
      body: `${productName} dropped to ${formatPrice(price, lang)} (your target: ${formatPrice(targetPrice, lang)}).`,
    }),
    Delisted: ({ productName, lastPrice }, lang) => ({
      title: "Product no longer available",
      body: `${productName} was removed from the platform${lastPrice != null ? ` (last price: ${formatPrice(lastPrice, lang)})` : ""}. Price tracking has stopped.`,
    }),
  },
  vi: {
    TargetReached: ({ productName, price, targetPrice }, lang) => ({
      title: "Đã chạm giá mục tiêu",
      body: `${productName} đã giảm còn ${formatPrice(price, lang)} (mục tiêu của bạn: ${formatPrice(targetPrice, lang)}).`,
    }),
    Delisted: ({ productName, lastPrice }, lang) => ({
      title: "Sản phẩm không còn trên sàn",
      body: `${productName} đã bị gỡ khỏi sàn${lastPrice != null ? ` (giá cuối cùng: ${formatPrice(lastPrice, lang)})` : ""}. Đã ngưng theo dõi giá.`,
    }),
  },
};

/** { title, body } cho một thông báo; loại lạ / thiếu dữ liệu → dùng câu tiếng Anh backend lưu sẵn. */
export function formatNotification(notification, lang = getLanguage()) {
  const build = (MESSAGES[lang] ?? MESSAGES[DEFAULT_LANGUAGE])[notification.type];
  if (build && notification.data) {
    try {
      return build(notification.data, lang);
    } catch {
      // dữ liệu không đúng dạng → rơi xuống câu dự phòng
    }
  }
  return { title: notification.title, body: notification.content };
}

const UI = {
  en: { title: "Notifications", markAll: "Mark all as read", empty: "You're all caught up", emptyHint: "Price alerts and product updates will show up here.", loadMore: "Load older", untracked: "You no longer track this product.", open: "Notifications", unread: "unread" },
  vi: { title: "Thông báo", markAll: "Đánh dấu đã đọc tất cả", empty: "Không có thông báo mới", emptyHint: "Cảnh báo giá và cập nhật sản phẩm sẽ hiện ở đây.", loadMore: "Xem cũ hơn", untracked: "Bạn không còn theo dõi sản phẩm này.", open: "Thông báo", unread: "chưa đọc" },
};

/** Chữ của khung chuông (tiêu đề, nút…) theo ngôn ngữ. */
export const notificationUi = (lang = getLanguage()) => UI[lang] ?? UI[DEFAULT_LANGUAGE];

/** "5 minutes ago" / "5 phút trước". */
export function formatRelativeTime(date, lang = getLanguage()) {
  const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(LOCALES[lang] ?? LOCALES.en, { numeric: "auto" });
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(0, "second");
}
