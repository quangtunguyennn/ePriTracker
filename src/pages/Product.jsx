import { useState, useEffect } from "react";
import axios from "axios";
import { faJira } from "@fortawesome/free-brands-svg-icons/faJira";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown } from "@fortawesome/free-solid-svg-icons/faSortDown";
import { faSortUp } from "@fortawesome/free-solid-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import ProductItem from "../components/ProductItem";
import { Link } from "react-router-dom";

export default function Product() {
  // 1. Quản lý State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkProduct, setLinkProduct] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // BASE URL Backend của bạn
  const BASE_URL = "https://localhost:44338";

  // 2. Hàm Fetch toàn bộ danh sách sản phẩm (getAll)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/api/Product/getAll`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 3. Hàm xử lý Thêm sản phẩm mới (Track) - ĐÃ FIX URL
  const handleAddProduct = async () => {
    if (!linkProduct.trim()) {
      alert("Vui lòng nhập link sản phẩm!");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      // GỌI ĐÚNG ĐƯỜNG DẪN API
      // Lưu ý: Đổi chữ "AddProduct" ở cuối thành tên Route thực tế trong file C# ProductController của bạn
      // (ví dụ: nếu bạn để [HttpPost("add")] thì đổi thành /api/Product/add)
      const endpoint = `${BASE_URL}/api/Product/add`;

      // Gửi request POST
      // Nếu Backend của bạn khai báo tham số là [FromBody] string productLink
      await axios.post(endpoint, JSON.stringify(linkProduct), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Thêm sản phẩm thành công!");
      setLinkProduct(""); // Reset ô input
      fetchProducts(); // Gọi lại API getAll để refresh danh sách hiển thị
    } catch (error) {
      // Xử lý lỗi trả về từ Backend (ví dụ: Link không hợp lệ, sản phẩm đã tồn tại...)
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "Lỗi khi thêm sản phẩm!";
      alert(`Thất bại: ${errorMsg}`);
      console.error("Add Product Error:", error.response);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Hàm hỗ trợ: Dán nhanh link từ Clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLinkProduct(text);
    } catch (err) {
      console.error("Không thể dán từ clipboard", err);
    }
  };

  // 5. Filter tìm kiếm sản phẩm theo tên
  const filteredProducts = products.filter((item) =>
    item.productName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* KHỐI INPUT TRACK LINK SẢN PHẨM */}
      <div className="">
        <div className="flex items-center justify-center w-full px-4">
          <div className="group flex w-1/2 focus:w-full transition-all duration-500 ease-in-out">
            <div className="relative flex-1">
              <input
                className="w-full h-full border-2 border-gray-300 border-r-0 rounded-l-md pl-12 pr-4 py-2 font-syne text-2xl outline-none"
                type="text"
                name="linkProduct"
                placeholder="Enter product's link ... "
                value={linkProduct}
                onChange={(e) => setLinkProduct(e.target.value)}
              />

              <button
                type="button"
                onClick={handlePaste}
                className="absolute left-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                title="Paste link"
              >
                <img className="w-8 h-8" src="paste.png" alt="paste" />
              </button>
            </div>

            <button
              onClick={handleAddProduct}
              disabled={isSubmitting}
              className="flex items-center gap-2 font-syne bg-orange-500 text-white font-bold border-2 border-orange-500 hover:bg-orange-600 transition-colors px-4 py-2 text-xl rounded-r-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              type="button"
            >
              {isSubmitting ? "Tracking..." : "Track"}{" "}
              <FontAwesomeIcon icon={faJira} />
            </button>
          </div>
        </div>
      </div>

      {/* KHỐI THANH LỌC VÀ TÌM KIẾM */}
      <div className="flex items-center justify-center w-full pt-8 px-4">
        <div className="flex w-full items-stretch shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <input
              className="w-full h-full hover:w-full border-2 border-gray-300 border-r-0 rounded-l-md pl-12 pr-4 py-2 font-syne text-lg outline-none focus:border-orange-500 transition-colors"
              type="text"
              placeholder="Search products ... "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            className="flex items-center gap-2 font-syne border-2 border-gray-300 border-r-0 px-4 py-2 text-lg bg-white cursor-pointer hover:bg-gray-50 hover:text-orange-500 transition-colors"
            type="button"
          >
            Date <FontAwesomeIcon icon={faSortDown} className="text-gray-400" />
          </button>

          <button
            className="flex items-center gap-2 font-syne border-2 border-gray-300 border-r-0 px-4 py-2 text-lg bg-white cursor-pointer hover:bg-gray-50 hover:text-orange-500 transition-colors"
            type="button"
          >
            Price <FontAwesomeIcon icon={faSortUp} className="text-gray-400" />
          </button>

          <select
            className="font-syne border-2 border-gray-300 border-r-0 px-4 py-2 text-lg outline-none bg-white cursor-pointer hover:bg-gray-50 hover:text-orange-500 transition-colors"
            defaultValue=""
          >
            <option value="" disabled hidden>
              Price Status
            </option>
            <option value="1">All Products</option>
            <option value="2">On Sale</option>
            <option value="3">Target Reached</option>
          </select>

          <button
            className="font-syne border-2 border-gray-300 px-4 py-2 text-lg outline-none bg-white cursor-pointer hover:bg-gray-50 hover:text-orange-500 rounded-r-md transition-colors"
            type="button"
          >
            Advanced Filters
          </button>
        </div>
      </div>

      {/* KHỐI HIỂN THỊ DANH SÁCH SẢN PHẨM */}
      <div className="flex flex-wrap pt-12 cursor-pointer">
        {loading ? (
          <div className="w-full text-center py-8 font-syne text-xl text-gray-500">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="w-full text-center py-8 font-syne text-xl text-gray-500">
            No products found.
          </div>
        ) : (
          filteredProducts.map((item) => (
            <Link
              key={item.productId} // Chuyển key ra thẻ ngoài cùng
              to={`/product/${item.productId}`}
              className="block w-full sm:w-1/2 md:w-1/3 p-2" // Đưa width ra thẻ Link, thêm 'block'
            >
              <ProductItem
                productName={item.productName}
                image={item.imageURL}
                initialPrice={
                  item.initialPrice
                    ? `${item.initialPrice.toLocaleString("vi-VN")} ₫`
                    : "0 ₫"
                }
              />
            </Link>
          ))
        )}
      </div>
    </>
  );
}
