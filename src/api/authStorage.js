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

// Ngôn ngữ giao diện người dùng đã chọn (giữ lại cả khi đăng xuất). Trình duyệt chặn localStorage → coi như chưa chọn.
const LANGUAGE_KEY = "language";

export const getLanguagePreference = () => {
  try {
    return localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
};

export const saveLanguagePreference = (language) => {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // không lưu được thì lần sau dùng lại ngôn ngữ của trình duyệt
  }
};
