import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faJira } from "@fortawesome/free-brands-svg-icons/faJira";
import {
  faSortDown,
  faSortUp,
  faMagnifyingGlass,
  faPaste,
  faSpinner,
  faBoxOpen,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import ProductItem from "../components/ProductItem";

// Import thư viện thông báo góc phải và modal xác nhận
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

export default function Product() {
  // 1. State Management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkProduct, setLinkProduct] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Backend BASE URL
  const BASE_URL = "https://localhost:44338";

  // 2. Fetch product list
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/product/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error loading product list:", error);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 3. Add new product
  const handleAddProduct = async (e) => {
    e?.preventDefault();
    if (!linkProduct.trim()) {
      toast.error("Please enter a product link!");
      return;
    }

    // Hiển thị trạng thái loading ở góc phải
    const loadingToast = toast.loading("Adding product...");

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const endpoint = `${BASE_URL}/api/product/add`;

      await axios.post(endpoint, JSON.stringify(linkProduct), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Cập nhật toast thành thành công
      toast.success("Product added successfully!", {
        id: loadingToast,
        duration: 3000,
      });

      setLinkProduct("");
      fetchProducts();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "Error adding product!";

      // Cập nhật toast thành lỗi
      toast.error(`Failed: ${errorMsg}`, {
        id: loadingToast,
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
const handleDeleteProduct = async (id) => {
  const result = await Swal.fire({
    // Nội dung ngắn gọn, dứt khoát
    title: "Delete product?",
    text: "This action cannot be undone.",
    icon: "warning",
    iconColor: "#ea580c", // Đồng bộ màu icon với màu thương hiệu (cam)

    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",

    // QUAN TRỌNG: Tắt toàn bộ style gốc của SweetAlert
    buttonsStyling: false,

    // UX: Đưa nút Cancel sang trái, mặc định focus vào Cancel
    reverseButtons: true,
    focusCancel: true,

    // Hiệu ứng mờ nền (Backdrop Blur) sang trọng
    backdrop: `
      rgba(0, 0, 0, 0.4)
      backdrop-filter
      backdrop-blur-sm
    `,

    customClass: {
      container: "!font-sans",

      // 1. KÉO GIÃN CHIỀU NGANG: Dùng !w-full !max-w-lg (~512px) thay vì !max-w-sm
      popup: "!rounded-2xl !shadow-2xl !border !border-gray-100 !p-8 !bg-white !w-[2000px] !max-w-lg",

      // Tiêu đề: Đã hạ xuống !text-3xl để cân đối với khung hình rộng
      title: "!text-3xl !font-semibold !font-questrial !text-gray-900 !p-0 !m-0 !mt-2",

      // 2. SỬA LỖI TEXT: Đưa font-syne và kích thước chữ vào 'htmlContainer'
      htmlContainer: "!text-base !font-lexend !italic   !text-gray-500 !mt-3 !mb-8 !p-0 !font-normal",
      text: "!font-3xl",
      // Vùng chứa nút
      actions: "!flex !w-full !gap-4 !justify-center !mt-0 !p-0",

      // Nút Delete
      confirmButton:
        "!bg-[#ea580c] !font-questrial  !cursor-pointer hover:!bg-[#c2410c] !text-white !font-bold !rounded-lg !px-8 !py-3 !transition-all !shadow-sm !border !border-transparent",

      // Nút Cancel
      cancelButton:
        "!bg-white !font-questrial  !font-bold !cursor-pointer hover:!bg-gray-50 !text-gray-700  !rounded-lg !px-8 !py-3 !border !border-gray-200 !transition-all !shadow-sm",
    },
  });

  
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/product/delete`, {
        params: { id },
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.productId !== id)); // Optimistic UI update
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed!");
    }
  };

  // 4. Quick paste from Clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLinkProduct(text);
      toast.success("Pasted from clipboard", {
        icon: "📋",
        duration: 2000,
      });
    } catch (err) {
      console.error("Failed to paste from clipboard", err);
      toast.error("Failed to paste from clipboard");
    }
  };

  // 5. Filter
  const filteredProducts = products.filter((item) =>
    item.productName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 font-syne relative">
      {/* Component chứa các thông báo góc trên bên phải */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "font-syne text-sm font-medium",
          duration: 3000,
          style: {
            padding: "16px",
            borderRadius: "12px",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          },
          success: {
            style: {
              background: "#f0fdf4",
              color: "#166534",
              border: "1px solid #bbf7d0",
            },
            iconTheme: { primary: "#22c55e", secondary: "#fff" },
          },
          error: {
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fecaca",
            },
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* SECTION 1: HEADER & TRACKING INPUT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="mb-6 max-w-2xl">
            <h1 className="font-urbanist md:text-3xl font-bold text-gray-900 mb-2">
              Product Tracker
            </h1>
            <p className="text-gray-500 font-ggf text-sm md:text-base">
              Paste product links from e-commerce platforms to start tracking
              price changes.
            </p>
          </div>

          <form
            onSubmit={handleAddProduct}
            className="flex flex-col md:flex-row gap-3"
          >
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="text-gray-400 group-focus-within:text-orange-500 transition-colors"
                />
              </div>
              <input
                className="block w-full pl-11 pr-12 py-3.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 sm:text-lg"
                type="url"
                required
                placeholder="https://example.com/product..."
                value={linkProduct}
                onChange={(e) => setLinkProduct(e.target.value)}
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-400 hover:text-gray-700 transition-colors"
                title="Paste from Clipboard"
              >
                <FontAwesomeIcon icon={faPaste} className="text-lg" />
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`
    relative group overflow-hidden inline-flex items-center justify-center gap-3 
    px-8 py-3 rounded-xl text-white tracking-wide
    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
    transition-all duration-300 ease-out cursor-pointer font-questrial font-semibold text-base
    ${
      isSubmitting
        ? "bg-orange-500 opacity-75 cursor-not-allowed shadow-none scale-100"
        : "bg-gradient-to-b from-orange-400 to-orange-600 hover:from-orange-400 hover:to-orange-500 active:scale-[0.97] hover:-translate-y-[1px] shadow-[inset_0px_1px_0px_rgba(255,255,255,0.3),0px_4px_8px_rgba(0,0,0,0.05),0px_12px_24px_rgba(249,115,22,0.3)] hover:shadow-[inset_0px_1px_0px_rgba(255,255,255,0.5),0px_6px_12px_rgba(0,0,0,0.1),0px_16px_32px_rgba(249,115,22,0.4)]"
    }
  `}
            >
              {/* Hiệu ứng vệt sáng (Shimmer) - Làm mượt & thực tế hơn */}
              {!isSubmitting && (
                <span className=" absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-[150%] transition-transform duration-[1.2s] ease-in-out pointer-events-none z-0" />
              )}

              {/* Lớp bọc nội dung (z-10) */}
              <span className="relative z-10 flex items-center justify-center gap-2.5 w-full">
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin text-lg text-white/90"
                    />
                    <span className="animate-pulse">Processing...</span>
                  </>
                ) : (
                  <>
                    <span>TRACK</span>
                    {/* Đổi từ rotate sang dịch chuyển nhẹ (Nghiệp vụ "Track" thường mang ý nghĩa tiến về phía trước) */}
                    {/* <FontAwesomeIcon
                      icon={faJira}
                      className="text-lg text-white/90 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all duration-300"
                    /> */}
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* SECTION 2: TOOLBAR (FILTER & SEARCH) */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="text-gray-400"
              />
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors sm:text-sm"
              type="text"
              placeholder="Search your list..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button className="flex-1 font-questrial font-semibold lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors">
              Date Added{" "}
              <FontAwesomeIcon icon={faSortDown} className="mt-[-4px]" />
            </button>

            <button className="flex-1 font-questrial font-semibold  lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors">
              Price <FontAwesomeIcon icon={faSortUp} className="mt-[4px]" />
            </button>

            <select className="flex-1 lg:flex-none block pl-3 pr-8 py-2 text-sm border-gray-200 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer  text-gray-700  font-questrial font-semibold">
              <option value="" disabled hidden>
                Price Status
              </option>
              <option className="font-questrial font-semibold" value="1">
                All Products
              </option>
              <option className="font-questrial font-semibold" value="2">
                On Sale
              </option>
              <option className="font-questrial font-semibold" value="3">
                Target Reached
              </option>
            </select>

            <button className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm  text-gray-700  font-questrial font-semibold hover:bg-gray-50 hover:text-orange-600 transition-colors">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />{" "}
              Advanced Filters
            </button>
          </div>
        </div>

        {/* SECTION 3: PRODUCT GRID */}
        <div>
          {loading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-20">
              <FontAwesomeIcon
                icon={faSpinner}
                className="animate-spin text-4xl text-orange-500 mb-4"
              />
              <p className="text-gray-500 text-lg">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-2xl border-dashed">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={faBoxOpen}
                  className="text-3xl text-gray-400"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No products found
              </h3>
              <p className="text-gray-500 max-w-sm text-center mb-6">
                You haven't tracked any products yet, or no products match your
                search query.
              </p>
            </div>
          ) : (
            // Product Grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-center transition-transform hover:-translate-y-1 duration-300"
                >
                  <ProductItem
                    productId={item.productId}
                    productName={item.productName}
                    image={item.imageURL}
                    desc={item.desc}
                    initialPrice={
                      item.initialPrice
                        ? `${item.initialPrice.toLocaleString("vi-VN")} ₫`
                        : "0 ₫"
                    }
                    latestPrice={
                      item.latestPrice
                        ? `${item.latestPrice.toLocaleString("vi-VN")} ₫`
                        : "0 ₫"
                    }
                    // 👇 Truyền thêm 2 dữ liệu mới vào đây 👇
                    productLink={item.productLink}
                    lastUpdatedAt={item.lastUpdatedAt}
                    onDelete={() => handleDeleteProduct(item.productId)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
