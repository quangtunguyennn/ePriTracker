// src/pages/Home.jsx
export default function Home() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
        Chào mừng đến với Cửa Hàng Công Nghệ!
      </h1>
      <p className="text-gray-600 max-w-md mx-auto">
        Đây là nội dung riêng của Trang Chủ. Bạn có thể bấm vào mục "Sản phẩm" trên thanh menu để thử tính năng chuyển trang mà không bị load lại trình duyệt.
      </p>
    </div>
  );
}