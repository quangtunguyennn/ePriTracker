import axios from "axios";
import { clearAuth, getToken } from "./authStorage";

// Địa chỉ backend lấy từ biến môi trường (.env.development / .env.production),
// thiếu thì dùng địa chỉ IIS Express mặc định khi chạy bằng Visual Studio
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:44338";

const api = axios.create({ baseURL: API_BASE_URL });

// Tự gắn JWT vào mọi request (nếu đã đăng nhập)
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token hết hạn / không hợp lệ → xoá phiên đăng nhập và đưa về trang Login.
// Chỉ áp dụng cho request CÓ gửi token: đăng nhập sai mật khẩu (không có token) vẫn để trang tự báo lỗi.
// Request nào muốn tự xử lý 401 thì truyền { skipAuthRedirect: true }.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const sentToken = !!error.config?.headers?.Authorization;
    if (error.response?.status === 401 && sentToken && !error.config?.skipAuthRedirect) {
      clearAuth();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

/** Lấy message lỗi backend trả về ({ message }), không có thì dùng câu mặc định. */
export const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

export default api;
