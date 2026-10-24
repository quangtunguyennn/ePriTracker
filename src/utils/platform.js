// Nhận diện sàn TMĐT từ link sản phẩm (khớp với các strategy ở backend: TikiScraper, CellphoneSScraper)
const PLATFORMS = [
  { name: "Tiki", hosts: ["tiki.vn"] },
  { name: "CellphoneS", hosts: ["cellphones.com.vn"] },
];

/** @returns {string|null} Tên sàn, ví dụ "Tiki"; null nếu không nhận ra. */
export const getPlatformFromUrl = (url) => {
  if (!url) return null;
  try {
    const host = new URL(url.includes("://") ? url : `https://${url}`).hostname.toLowerCase();
    const match = PLATFORMS.find((p) =>
      p.hosts.some((h) => host === h || host.endsWith(`.${h}`)),
    );
    return match?.name ?? null;
  } catch {
    return null;
  }
};
