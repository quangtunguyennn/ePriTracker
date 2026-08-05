import { Link } from "react-router-dom"; // Hoặc "next/link" nếu dùng Next.js
import axios from "axios";
export default function ProductItem(props) {
  const { productId, productName, image, desc, initialPrice, onDelete } = props;
  
  return (
    <article className="shadow-lg w-full h-full p-4 bg-white rounded-lg flex flex-col justify-between">
      <div>
        {/* 1. CHỈ BỌC LINK CHO ẢNH */}
        <Link
          to={`/product/${productId}`}
          className="block overflow-hidden rounded-md group"
        >
          <img
            src={image}
            alt={productName}
            className="w-full h-auto  object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="mt-4 flex flex-col justify-between">
          <div>
            {/* 2. CHỈ BỌC LINK CHO TÊN SẢN PHẨM */}
            <Link
              to={`/product/${productId}`}
              className="font-raleway font-semibold text-2xl hover:text-blue-600 transition-colors inline-block"
            >
              {productName}
            </Link>

            <p className="font-urbanist text-lg text-gray-600 line-clamp-2 mt-1">
              {desc}
            </p>
          </div>

          <p className="font-urbanist pt-2 text-3xl font-medium text-red-900 mt-2">
            {initialPrice}
          </p>
        </div>
      </div>

      {/* Cụm nút bấm */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 gap-2">
        {/* Nút Delete độc lập, không bị nảy sang trang detail */}
        <button
          type="button"
          onClick={onDelete}
          className="px-20 py-2 text-lg font-syne  text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors duration-200 flex items-center gap-1.5 cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete
        </button>

        {/* 3. NÚT DETAIL BỌC BẰNG LINK ĐỂ CHUYỂN TRANG */}
        <Link
          to={`/product/${productId}`}
          className="px-8 py-2 text-lg font-syne font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
        >
          Detail
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
