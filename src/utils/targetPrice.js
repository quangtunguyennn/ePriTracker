/**
 * Giá mục tiêu nhập trong popup "Set Target Price" (trang Products, EventDetail).
 * Không bắt buộc: để trống → theo dõi bình thường, chỉ không có cảnh báo giá (BE nhận targetPrice = null).
 */

/** Dùng cho inputValidator của SweetAlert: trả câu lỗi, hoặc undefined nếu hợp lệ. */
export const validateTargetPrice = (value) => {
  const text = (value ?? "").trim();
  if (text === "") return undefined;
  const price = Number(text);
  if (!Number.isFinite(price) || price <= 0) {
    return "Please enter a valid price, or leave it blank.";
  }
  return undefined;
};

/** Chuỗi đã qua validateTargetPrice → số, hoặc null khi để trống. */
export const parseTargetPrice = (value) => {
  const text = (value ?? "").trim();
  return text === "" ? null : Number(text);
};
