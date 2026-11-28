import { useTranslation } from "react-i18next";
import { LANGUAGES, setLanguage } from "../i18n";

// Nút chuyển EN | VI. Đổi là áp dụng ngay (không tải lại trang) và được nhớ cho lần sau.
export default function LanguageSwitcher({ className = "" }) {
  const { i18n, t } = useTranslation();
  const current = i18n.language;

  return (
    <div
      role="group"
      aria-label={t("Language")}
      className={`inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-xs font-bold font-questrial shadow-sm ${className}`}
    >
      {LANGUAGES.map(({ code, label, name }) => {
        const active = current === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            aria-pressed={active}
            title={name}
            lang={code}
            className={`cursor-pointer rounded-full px-2.5 py-1 transition-colors duration-150 ${
              active ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
