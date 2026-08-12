// src/components/CustomScrollRestoration.jsx
import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function CustomScrollRestoration() {
  const location = useLocation();
  const navType = useNavigationType();

  // 1. Lưu lại tọa độ cuộn chuột hiện tại trước khi rời trang
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`scroll_${location.key}`, window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.key]);

  // 2. Khôi phục vị trí
  useEffect(() => {
    if (navType === "POP") {
      const savedPosition = sessionStorage.getItem(`scroll_${location.key}`);
      if (savedPosition) {
        const targetY = parseInt(savedPosition, 10);

        // MẸO: Thử cuộn xuống liên tục mỗi 100ms để đợi API tải xong Data
        const scrollInterval = setInterval(() => {
          window.scrollTo(0, targetY);
          
          // Nếu đã cuộn tới đúng đích (sai số 1px) thì dừng vòng lặp lại
          if (Math.abs(window.scrollY - targetY) <= 1) {
            clearInterval(scrollInterval);
          }
        }, 100);

        // Tự động hủy sau 1.5 giây để nếu API lỗi hoặc mạng chậm, nó không bị lặp vô hạn
        setTimeout(() => {
          clearInterval(scrollInterval);
        }, 1500);

        // Dọn dẹp nếu người dùng lập tức chuyển sang trang khác
        return () => clearInterval(scrollInterval);
      }
    } else {
      // Nếu là chuyển sang trang mới hoàn toàn (PUSH) thì lên đầu trang ngay lập tức
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location.key, navType]);

  return null;
}