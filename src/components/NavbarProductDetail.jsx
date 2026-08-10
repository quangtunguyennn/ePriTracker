// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Import thêm hook này
export default function NavbarProductDetail() {
  // Hàm xử lý cuộn trang mượt mà
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // Trừ đi khoảng cách của navbar (offset) để không bị che mất tiêu đề
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Class dùng chung cho các item trong menu để code gọn gàng hơn
  const navItemClass =
    "relative cursor-pointer text-gray-600 hover:text-yellow-600 transition-colors duration-300 text-base font-medium font-urbanist group bg-transparent border-none p-0";

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-4 transition-all">
      {/* Container giới hạn độ rộng và căn giữa */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12">
        
        {/* Các mục menu (Được căn giữa) */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          
          {/* Đã sửa lại cấu trúc nút Products giống các nút khác */}
          <Link to="/products" className={navItemClass}>
            Products
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>

          {/* Thay span bằng button để chuẩn semantic web */}
          <button
            onClick={() => scrollToSection("detail")}
            className={navItemClass}
          >
            Detail
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-600 transition-all duration-300 group-hover:w-full"></span>
          </button>

          <button
            onClick={() => scrollToSection("description")}
            className={navItemClass}
          >
            Product Description
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-600 transition-all duration-300 group-hover:w-full"></span>
          </button>

          <button
            onClick={() => scrollToSection("suggestion")}
            className={navItemClass}
          >
            Suggestion Products
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-600 transition-all duration-300 group-hover:w-full"></span>
          </button>
        </div>
      </div>
    </nav>
  );
}