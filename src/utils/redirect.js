// Đường dẫn quay lại sau khi đăng nhập / đăng ký (?redirect=/events/abc).
// Chỉ nhận đường dẫn NỘI BỘ ("/..."), chặn "//evil.com" hay "https://..." để không bị lợi dụng chuyển hướng ra trang ngoài.
export function safeRedirect(value) {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

/** "/login" hoặc "/login?redirect=..." (tương tự cho "/register"). */
export function withRedirect(path, redirect) {
  const safe = safeRedirect(redirect);
  return safe ? `${path}?redirect=${encodeURIComponent(safe)}` : path;
}
