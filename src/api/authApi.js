import api from "./client";

/** @returns {{ token: string, userRoles: string[] }} */
export const login = (email, password) =>
  api.post("/api/auth/login", { email, password }).then((res) => res.data);

export const register = ({ firstName, lastName, email, password }) =>
  api
    .post("/api/auth/register", { firstName, lastName, email, password })
    .then((res) => res.data);

/** Thông tin user hiện tại. Tự xử lý 401 (token hết hạn) thay vì bị chuyển trang. */
export const getMe = () =>
  api.get("/api/auth/me", { skipAuthRedirect: true }).then((res) => res.data);
