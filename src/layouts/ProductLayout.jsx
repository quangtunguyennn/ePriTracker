// src/layouts/ProductLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomScrollRestoration from "../components/CustomScrollRestoration";
export default function ProductLayout() {
  // Mỗi lần đổi trang, phần nội dung hiện dần (Navbar/Footer đứng yên) – xem .anim-page trong index.css
  const { pathname } = useLocation();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
     <CustomScrollRestoration/>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div key={pathname} className="anim-page">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}