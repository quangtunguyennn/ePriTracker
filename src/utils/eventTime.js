import i18n, { getLocale } from "../i18n";

// Giờ kết thúc sự kiện – chỉ có khi sàn công bố giờ thật (vd khung flash sale CellphoneS).
// endsAtIsExact = false: hạn tạm do hệ thống tự gia hạn → không hiển thị.
export const getEventEndLabel = (event) => {
  if (!event?.endsAt || !event.endsAtIsExact) return null;

  const end = new Date(event.endsAt);
  const time = end.toLocaleTimeString(getLocale(), { hour: "2-digit", minute: "2-digit" });
  const isToday = end.toDateString() === new Date().toDateString();
  const day = end.toLocaleDateString(getLocale(), { month: "short", day: "numeric" });

  return isToday ? i18n.t("Ends at {{time}} today", { time }) : i18n.t("Ends at {{time}}, {{day}}", { time, day });
};
