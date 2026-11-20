// src/layouts/DetailLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import NavbarProductDetail from "../components/NavbarProductDetail";
import Footer from "../components/Footer";

export default function DetailLayout() {
  // Mỗi lần đổi trang, phần nội dung hiện dần (Navbar/Footer đứng yên) – xem .anim-page trong index.css
  const { pathname } = useLocation();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
  
      {/* Navbar luôn xuất hiện ở trên cùng của mọi trang dùng layout này */}
      <NavbarProductDetail />

      {/* Vị trí <Outlet /> này sẽ tự động biến thành nội dung của Home hoặc Products */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div key={pathname} className="anim-page">
          <Outlet />
        </div>
      </main>

      {/* Footer luôn xuất hiện ở dưới cùng của mọi trang */}
      {/* <footer className="bg-gray-900 text-gray-400 text-center py-4 text-sm">
        <p>© 2026 TechStore. Tất cả quyền được bảo lưu.</p>
      </footer> */}

      <Footer />
    </div>
  );
}
