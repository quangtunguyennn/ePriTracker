// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import UserIcon from "./UserIcon"; // Component UserDropdownMenu của bạn

export default function Navbar() {
  const [isUserIconClicked, setIsUserIconClicked] = useState(false);

  // 1. Thêm state quản lý trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 2. Kiểm tra token khi component được render
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []); // [] chạy 1 lần khi load Navbar

  const toggleUserMenu = () => {
    setIsUserIconClicked((prevState) => !prevState);
  };

  return (
    <nav className="sticky top-0 z-2 text-black bg-neutral-100 p-4 md:flex justify-between items-center pl-8 pr-8 shadow-md">
      {/* Logo & Brand */}
      <div className="flex gap-2 justify-start">
        <div className="flex">
          <img
            className="w-10 h-10 object-contain"
            src="/paypal.png"
            alt="logo"
          />
        </div>

        <div className="flex items-center justify-center">
          <span className="font-urbanist text-3xl font-semibold">
            ePriTracker
          </span>
        </div>
      </div>

      {/* Navigation Links & Actions */}
      <div className="flex gap-16">
        <div className="flex items-center gap-16">
          {" "}
          {/* Đổi gap-18 (không chuẩn trong Tailwind) thành gap-8 */}
          <Link
            to="/"
            className="hover:text-yellow-600 transition-colors text-xl font-semibold no-underline font-urbanist"
          >
            Home
          </Link>
          {/* 3. Render có điều kiện: Chỉ hiện khi isLoggedIn = true */}
          {isLoggedIn && (
            <Link
              to="/products"
              className="hover:text-yellow-600 transition-colors text-xl font-semibold no-underline font-urbanist"
            >
              Products
            </Link>
          )}
          <Link
            to="/events" // Thêm đường dẫn tạm
            className="hover:text-yellow-600 transition-colors text-xl font-semibold no-underline font-urbanist"
          >
            Events
          </Link>
        </div>

        {/* User & Notifications */}
        <div className="flex gap-4 relative items-center">
          <div>
            <img
              onClick={toggleUserMenu}
              className="w-8 h-8 object-contain cursor-pointer"
              src="user.svg"
              alt="User Menu"
            />
            {isUserIconClicked && <UserIcon />}
          </div>

          {/* 4. Ẩn/hiện icon thông báo dựa trên trạng thái đăng nhập */}
          {isLoggedIn && (
            <div>
              <img
                className="w-7 h-7 object-contain cursor-pointer"
                src="notify.svg"
                alt="Notifications"
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}