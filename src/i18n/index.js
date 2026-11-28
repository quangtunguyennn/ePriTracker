// Đa ngôn ngữ (i18next). KHOÁ DỊCH = chính câu tiếng Anh: t("Sign in") → tiếng Anh hiện nguyên câu,
// tiếng Việt tra trong locales/vi.json (thiếu bản dịch → tự hiện tiếng Anh, không vỡ giao diện).
// Thêm câu mới: viết t(câu tiếng Anh) trong component rồi thêm cặp câu tiếng Anh: bản dịch vào vi.json.
// Đổi câu tiếng Anh nhớ đổi luôn khoá trong vi.json.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import vi from "./locales/vi.json";
import { getLanguagePreference, saveLanguagePreference } from "../api/authStorage";

export const LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "vi", label: "VI", name: "Tiếng Việt" },
];
export const DEFAULT_LANGUAGE = "en";

const isSupported = (code) => LANGUAGES.some((l) => l.code === code);

/** Đã chọn trước đó → dùng lại; chưa chọn → theo ngôn ngữ trình duyệt; còn lại tiếng Anh. */
function detectLanguage() {
  const saved = getLanguagePreference();
  if (isSupported(saved)) return saved;
  const browser = (navigator.language || "").toLowerCase();
  return browser.startsWith("vi") ? "vi" : DEFAULT_LANGUAGE;
}

i18n.use(initReactI18next).init({
  resources: { vi: { translation: vi } },
  lng: detectLanguage(),
  fallbackLng: false, // tiếng Anh không có file: thiếu khoá → trả về chính câu tiếng Anh
  keySeparator: false, // câu có dấu "." / ":" vẫn là một khoá
  nsSeparator: false,
  interpolation: { escapeValue: false }, // React tự chống XSS
  returnEmptyString: false,
});

document.documentElement.lang = i18n.language;
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  saveLanguagePreference(lng);
});

/** Ngôn ngữ đang dùng ("en" | "vi") – cho chỗ không dùng hook (axios, định dạng số…). */
export const getLanguage = () => (isSupported(i18n.language) ? i18n.language : DEFAULT_LANGUAGE);

export const setLanguage = (code) => {
  if (isSupported(code)) i18n.changeLanguage(code);
};

/** Locale cho Intl / toLocaleString theo ngôn ngữ đang dùng. */
export const getLocale = () => (getLanguage() === "vi" ? "vi-VN" : "en-US");

export default i18n;
