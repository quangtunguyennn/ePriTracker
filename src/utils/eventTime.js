// Giờ kết thúc sự kiện – chỉ có khi sàn công bố giờ thật (vd khung flash sale CellphoneS).
// endsAtIsExact = false: hạn tạm do hệ thống tự gia hạn → không hiển thị.
export const getEventEndLabel = (event) => {
  if (!event?.endsAt || !event.endsAtIsExact) return null;

  const end = new Date(event.endsAt);
  const time = end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const isToday = end.toDateString() === new Date().toDateString();
  const day = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return isToday ? `Ends at ${time} today` : `Ends at ${time}, ${day}`;
};
