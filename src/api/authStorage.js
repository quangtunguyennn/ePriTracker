// Nơi duy nhất đọc/ghi thông tin đăng nhập trong localStorage
const TOKEN_KEY = "token";
const ROLES_KEY = "userRoles";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const isLoggedIn = () => !!getToken();

export const saveAuth = (token, userRoles) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLES_KEY, JSON.stringify(userRoles ?? []));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLES_KEY);
};
